import type {
  ObservabilityBridgeInfo,
  ObservabilityEvent,
  ObservabilityFactReport,
  ObservabilityLoadedBeforeInfo,
  ObservabilityModuleInfoSummary,
  ObservabilityPhaseSummary,
  ObservabilityReport,
  ObservabilitySharedConflictInfo,
} from '../type';
import { omitUndefinedFields } from '../utils';

export function copyEvent(event: ObservabilityEvent): ObservabilityEvent {
  return omitUndefinedFields({
    ...event,
    remote: event.remote ? { ...event.remote } : undefined,
    resource: event.resource ? { ...event.resource } : undefined,
    shared: event.shared
      ? {
          ...event.shared,
          shareScope: event.shared.shareScope
            ? [...event.shared.shareScope]
            : undefined,
          availableVersions: event.shared.availableVersions
            ? [...event.shared.availableVersions]
            : undefined,
          conflict: copySharedConflict(event.shared.conflict),
        }
      : undefined,
    errorContext: event.errorContext ? { ...event.errorContext } : undefined,
    metadata: event.metadata ? { ...event.metadata } : undefined,
    loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
    bridge: copyBridgeInfo(event.bridge),
  });
}

export function copyBridgeInfo(
  bridge: ObservabilityBridgeInfo | undefined,
): ObservabilityBridgeInfo | undefined {
  if (!bridge) {
    return undefined;
  }

  return omitUndefinedFields({
    ...bridge,
    route: bridge.route ? { ...bridge.route } : undefined,
    error: bridge.error ? { ...bridge.error } : undefined,
  });
}

export function copySharedConflict(
  conflict: ObservabilitySharedConflictInfo | undefined,
): ObservabilitySharedConflictInfo | undefined {
  if (!conflict) {
    return undefined;
  }

  return {
    ...conflict,
    versions: [...conflict.versions],
    existingVersions: conflict.existingVersions.map((item) => ({ ...item })),
  };
}

export function copySummary(
  summary: ObservabilityReport['summary'],
): ObservabilityReport['summary'] {
  return {
    ...summary,
    phases: Object.entries(summary.phases).reduce<
      Record<string, ObservabilityPhaseSummary>
    >((memo, [phase, phaseSummary]) => {
      memo[phase] = { ...phaseSummary };
      return memo;
    }, {}),
    shared: summary.shared
      ? {
          ...summary.shared,
          shareScope: summary.shared.shareScope
            ? [...summary.shared.shareScope]
            : undefined,
        }
      : undefined,
    flags: { ...summary.flags },
    error: summary.error
      ? {
          ...summary.error,
          context: summary.error.context
            ? { ...summary.error.context }
            : undefined,
        }
      : undefined,
  };
}

export function copyFactReport(
  diagnosis: ObservabilityFactReport | undefined,
): ObservabilityFactReport | undefined {
  if (!diagnosis) {
    return undefined;
  }

  return {
    ...diagnosis,
    facts: { ...diagnosis.facts },
    completedPhases: [...diagnosis.completedPhases],
    pendingPhases: [...diagnosis.pendingPhases],
    warnings: diagnosis.warnings ? [...diagnosis.warnings] : undefined,
    actions: diagnosis.actions.map((action) => ({ ...action })),
  };
}

export function copyModuleInfoSummary(
  moduleInfo: ObservabilityModuleInfoSummary | undefined,
): ObservabilityModuleInfoSummary | undefined {
  if (!moduleInfo) {
    return undefined;
  }

  return {
    ...moduleInfo,
    entries: moduleInfo.entries.map((entry) => ({ ...entry })),
    availableNames: moduleInfo.availableNames
      ? [...moduleInfo.availableNames]
      : undefined,
  };
}

export function copyLoadedBeforeInfo(
  loadedBefore: ObservabilityLoadedBeforeInfo | undefined,
): ObservabilityLoadedBeforeInfo | undefined {
  if (!loadedBefore) {
    return undefined;
  }

  return {
    producer: loadedBefore.producer,
    expose: loadedBefore.expose,
    consumers: loadedBefore.consumers.map((consumer) => ({
      ...consumer,
      exposes: consumer.exposes ? [...consumer.exposes] : undefined,
    })),
  };
}

export function copyReport(report: ObservabilityReport): ObservabilityReport {
  return omitUndefinedFields({
    ...report,
    remote: report.remote ? { ...report.remote } : undefined,
    shared: report.shared
      ? {
          ...report.shared,
          shareScope: report.shared.shareScope
            ? [...report.shared.shareScope]
            : undefined,
          availableVersions: report.shared.availableVersions
            ? [...report.shared.availableVersions]
            : undefined,
          conflict: copySharedConflict(report.shared.conflict),
        }
      : undefined,
    errorContext: report.errorContext ? { ...report.errorContext } : undefined,
    moduleInfo: copyModuleInfoSummary(report.moduleInfo),
    loadedBefore: copyLoadedBeforeInfo(report.loadedBefore),
    bridge: copyBridgeInfo(report.bridge),
    events: report.events.map(copyEvent),
    summary: copySummary(report.summary),
    diagnosis: copyFactReport(report.diagnosis),
  });
}
