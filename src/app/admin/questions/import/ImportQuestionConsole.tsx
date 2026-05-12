"use client";

import { ChangeEvent, useState } from "react";
import type {
  QuestionValidationIssue,
  QuestionValidationReport,
} from "@/lib/questionValidation";

type ImportQuestionConsoleProps = {
  initialToken: string;
};

type ImportResult = {
  batchId: string;
  importedQuestionsCount: number;
  importedSetsCount: number;
  importedSetItemsCount: number;
  sets: QuestionValidationReport["summary"]["sets"];
};

type QuestionSetRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  is_active: boolean;
  updated_at: string;
};

type ImportApiResponse =
  | { ok: true; importResult: ImportResult }
  | { ok: false; message?: string; error?: string };

type PublishApiResponse =
  | { ok: true; publishedQuestionsCount: number }
  | { ok: false; message?: string; error?: string };

export function ImportQuestionConsole({
  initialToken,
}: ImportQuestionConsoleProps) {
  const [token, setToken] = useState(initialToken);
  const [filename, setFilename] = useState("");
  const [payload, setPayload] = useState<unknown>(null);
  const [parseError, setParseError] = useState("");
  const [validationReport, setValidationReport] =
    useState<QuestionValidationReport | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [sets, setSets] = useState<QuestionSetRow[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const canValidate = Boolean(token && payload && !parseError);
  const canImport =
    canValidate && Boolean(validationReport && validationReport.summary.errorCount === 0);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFilename(file?.name ?? "");
    setPayload(null);
    setParseError("");
    setValidationReport(null);
    setImportResult(null);
    setStatusMessage("");

    if (!file) return;

    try {
      const text = await file.text();
      setPayload(JSON.parse(text) as unknown);
    } catch {
      setParseError("Could not parse the selected file as JSON.");
    }
  }

  async function validateUpload() {
    if (!canValidate) return;
    setIsBusy(true);
    setStatusMessage("Validating...");
    setImportResult(null);

    try {
      const response = await fetch("/api/admin/questions/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, payload }),
      });
      const data = (await response.json()) as
        | QuestionValidationReport
        | { error: string };

      if (!response.ok || "error" in data) {
        setStatusMessage("error" in data ? data.error : "Validation failed.");
        return;
      }

      setValidationReport(data);
      setStatusMessage("Validation complete.");
    } finally {
      setIsBusy(false);
    }
  }

  async function importDraft() {
    if (!canImport) return;
    setIsBusy(true);
    setStatusMessage("Importing as draft...");

    try {
      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, filename, payload }),
      });
      const data = (await response.json()) as ImportApiResponse;

      if (!response.ok || !data.ok) {
        const failure = data as Extract<ImportApiResponse, { ok: false }>;
        setStatusMessage(failure.error ?? failure.message ?? "Import failed.");
        return;
      }

      setImportResult(data.importResult);
      setSelectedSetId(data.importResult.sets[0]?.id ?? "");
      setStatusMessage("Draft import complete.");
      await loadSets();
    } finally {
      setIsBusy(false);
    }
  }

  async function loadSets() {
    if (!token) return;
    const response = await fetch(
      `/api/admin/questions/sets?token=${encodeURIComponent(token)}`,
    );
    const data = (await response.json()) as
      | { sets: QuestionSetRow[] }
      | { error: string };

    if (!response.ok || "error" in data) {
      setStatusMessage("error" in data ? data.error : "Could not load sets.");
      return;
    }

    setSets(data.sets);
    if (!selectedSetId) setSelectedSetId(data.sets[0]?.id ?? "");
  }

  async function publishSelectedSet() {
    if (!selectedSetId) return;
    const confirmed = window.confirm(
      `Publish ${selectedSetId}? Published and active content becomes visible to the customer app.`,
    );
    if (!confirmed) return;

    setIsBusy(true);
    setStatusMessage("Publishing selected set...");

    try {
      const response = await fetch("/api/admin/questions/publish-set", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, setId: selectedSetId }),
      });
      const data = (await response.json()) as PublishApiResponse;

      if (!response.ok || !data.ok) {
        const failure = data as Extract<PublishApiResponse, { ok: false }>;
        setStatusMessage(failure.error ?? failure.message ?? "Publish failed.");
        return;
      }

      setStatusMessage(
        `Published ${selectedSetId} with ${data.publishedQuestionsCount} questions.`,
      );
      await loadSets();
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#f4f6fb] px-4 py-6 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Internal utility
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Question Import Console
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Upload generated original-question JSON, validate it, import valid
            content as draft, then publish a selected validated set.
          </p>
        </header>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Access token</h2>
          <p className="mt-1 text-sm text-slate-600">
            Temporary server-side token check only. The token is not stored.
          </p>
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e5fdc] focus:ring-2 focus:ring-[#1e5fdc]/15"
            placeholder="ADMIN_IMPORT_TOKEN"
            type="password"
            autoComplete="off"
          />
        </section>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Upload JSON</h2>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="mt-3 block w-full text-sm"
          />
          {filename ? (
            <p className="mt-2 text-sm text-slate-600">Selected: {filename}</p>
          ) : null}
          {parseError ? (
            <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {parseError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={validateUpload}
              disabled={!canValidate || isBusy}
              className="rounded-xl bg-[#1e5fdc] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={importDraft}
              disabled={!canImport || isBusy}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Import as draft
            </button>
            <button
              type="button"
              onClick={loadSets}
              disabled={!token || isBusy}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Load sets
            </button>
          </div>
          {statusMessage ? (
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {statusMessage}
            </p>
          ) : null}
        </section>

        {validationReport ? (
          <ValidationReportView report={validationReport} />
        ) : null}

        {importResult ? (
          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Import result</h2>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
              <Metric label="Batch ID" value={importResult.batchId} />
              <Metric
                label="Questions"
                value={importResult.importedQuestionsCount}
              />
              <Metric label="Sets" value={importResult.importedSetsCount} />
              <Metric
                label="Set items"
                value={importResult.importedSetItemsCount}
              />
            </div>
          </section>
        ) : null}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Publish selected set</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedSetId}
              onChange={(event) => setSelectedSetId(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select set</option>
              {[...(importResult?.sets ?? []), ...sets].map((set, index) => (
                <option key={`${set.id}-${index}`} value={set.id}>
                  {set.id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={publishSelectedSet}
              disabled={!selectedSetId || !token || isBusy}
              className="rounded-xl bg-[#1e5fdc] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Publish selected set
            </button>
          </div>

          {sets.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Set ID</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set) => (
                    <tr key={set.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-semibold">{set.id}</td>
                      <td className="px-3 py-2">{set.name}</td>
                      <td className="px-3 py-2">{set.type}</td>
                      <td className="px-3 py-2">{set.status}</td>
                      <td className="px-3 py-2">{String(set.is_active)}</td>
                      <td className="px-3 py-2">{set.updated_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function ValidationReportView({ report }: { report: QuestionValidationReport }) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Validation summary</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Metric label="Total questions" value={report.summary.totalQuestions} />
        <Metric label="Errors" value={report.summary.errorCount} />
        <Metric label="Warnings" value={report.summary.warningCount} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SummaryTable title="Sections" counts={report.summary.sections} />
        <SummaryTable title="Difficulties" counts={report.summary.difficulties} />
      </div>

      <SetSummaryTable sets={report.summary.sets} />
      <IssueTable title="Errors" issues={report.errors} />
      <IssueTable title="Warnings" issues={report.warnings} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SummaryTable({
  title,
  counts,
}: {
  title: string;
  counts: Record<string, number>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <table className="mt-2 w-full text-sm">
        <tbody>
          {Object.entries(counts).map(([key, count]) => (
            <tr key={key} className="border-t border-slate-100">
              <td className="py-2 pr-3">{key}</td>
              <td className="py-2 font-semibold">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SetSummaryTable({
  sets,
}: {
  sets: QuestionValidationReport["summary"]["sets"];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="text-sm font-semibold">Detected sets</h3>
      <table className="mt-2 w-full min-w-[680px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Set ID</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Questions</th>
            <th className="px-3 py-2">Sections</th>
            <th className="px-3 py-2">Difficulties</th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <tr key={set.id} className="border-t border-slate-100">
              <td className="px-3 py-2 font-semibold">{set.id}</td>
              <td className="px-3 py-2">{set.type}</td>
              <td className="px-3 py-2">{set.questionCount}</td>
              <td className="px-3 py-2">{formatCounts(set.sections)}</td>
              <td className="px-3 py-2">{formatCounts(set.difficulties)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssueTable({
  title,
  issues,
}: {
  title: string;
  issues: QuestionValidationIssue[];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="text-sm font-semibold">
        {title} ({issues.length})
      </h3>
      <table className="mt-2 w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Code</th>
            <th className="px-3 py-2">Message</th>
            <th className="px-3 py-2">Question ID</th>
            <th className="px-3 py-2">Set ID</th>
            <th className="px-3 py-2">Field</th>
          </tr>
        </thead>
        <tbody>
          {issues.length ? (
            issues.map((issue, index) => (
              <tr key={`${issue.code}-${index}`} className="border-t border-slate-100">
                <td className="px-3 py-2 font-semibold">{issue.code}</td>
                <td className="px-3 py-2">{issue.message}</td>
                <td className="px-3 py-2">{issue.questionId ?? ""}</td>
                <td className="px-3 py-2">{issue.setId ?? ""}</td>
                <td className="px-3 py-2">{issue.field ?? ""}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-3 py-2 text-slate-500" colSpan={5}>
                None
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([key, count]) => `${key}: ${count}`)
    .join(", ");
}
