export type GuardAtom = ["v", Dependency];
export type GuardPresenceAtom = ["p", ESMEvaluatedImportSpecifierDependency];
export type GuardUnknown = ["?"];
export type GuardNot = ["!", GuardFormula];
export type GuardLogical = ["&&" | "||" | "??", GuardFormula, GuardFormula];
export type GuardFormula = GuardAtom | GuardPresenceAtom | GuardUnknown | GuardNot | GuardLogical;
/**
 * branch guard: the dependency is live only when the formula evaluates to `value`
 */
export type DependencyGuard = {
    formula: GuardFormula;
    value: boolean;
};
export type GuardableDependency = ESMImportSpecifierDependency | CommonJsRequireDependency | CommonJsFullRequireDependency | ImportDependency;
/**
 * A guard frame pushed onto `parser.state.guardStack` for the duration of one
 * conditional branch body. Carries the `"x" in ns` presence guards and/or the
 * dead-branch dependency guard for that branch.
 */
export type GuardFrame = {
    /**
     * the conditional test (for the lazily built formula)
     */
    test?: Expression | undefined;
    /**
     * dependency count before the test was walked
     */
    depStart?: number | undefined;
    /**
     * branch truthiness the dependency guard is live for
     */
    condition?: boolean | undefined;
    /**
     * memoized dependency-guard formula (null = no knowable atom)
     */
    formula?: (GuardFormula | null) | undefined;
    /**
     * memoized presence formula (null = no presence atom)
     */
    presenceFormula?: (GuardFormula | null) | undefined;
};
/**
 * Tags a freshly created dependency with the active dependency guards.
 * @param {JavascriptParser} parser the parser
 * @param {GuardableDependency} dep the dependency
 */
export function attachDependencyGuards(parser: JavascriptParser, dep: GuardableDependency): void;
/**
 * Whether any guard proves its branch dead.
 * @param {DependencyGuard[]} guards dependency guards
 * @param {ModuleGraph} moduleGraph module graph
 * @param {RuntimeSpec} runtime runtime
 * @returns {boolean} true when a test is provably the opposite of its branch
 */
export function isDeadByGuards(guards: DependencyGuard[], moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean;
/**
 * Whether an active presence guard proves `ns.member` present, suppressing
 * export-presence errors. Each frame is evaluated against its branch condition,
 * so the `else` of `if (!("x" in ns))` also guards `ns.x`.
 * @param {JavascriptParser} parser the parser
 * @param {GuardFrame[]} stack the guard stack
 * @param {string} name namespace binding name
 * @param {string} member member key
 * @returns {boolean} true when a guard proves the member present
 */
export function isPresentByGuards(parser: JavascriptParser, stack: GuardFrame[], name: string, member: string): boolean;
import type Dependency from "../../graph/Dependency";
import type ESMEvaluatedImportSpecifierDependency from "./ESMEvaluatedImportSpecifierDependency";
import type ESMImportSpecifierDependency from "./ESMImportSpecifierDependency";
import type CommonJsRequireDependency from "../commonjs/CommonJsRequireDependency";
import type CommonJsFullRequireDependency from "../commonjs/CommonJsFullRequireDependency";
import type ImportDependency from "../import/ImportDependency";
import type { Expression } from "estree";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type ModuleGraph from "../../graph/ModuleGraph";
import type { RuntimeSpec } from "../../util/runtime";
