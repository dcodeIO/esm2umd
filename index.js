import { declare } from "@babel/helper-plugin-utils";
import { basename, extname } from "path";
import {
  isModule,
  rewriteModuleStatementsAndPrepareHeader,
  hasExports,
  isSideEffectImport,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  wrapInterop,
  getModuleName,
} from "@babel/helper-module-transforms";
import { types as t, template, transform } from "@babel/core";

const buildPrerequisiteAssignment = template(`
  GLOBAL_REFERENCE = GLOBAL_REFERENCE || {}
`);
const buildWrapper = template(`
  (function (global, factory) {
    function unwrapDefault(exports) {
      return ("default" in exports ? exports.default : exports);
    }
    if (typeof define === "function" && define.amd) {
      define(AMD_ARGUMENTS, function(FORWARD_NAMES) {
        var exports = {};
        factory(exports, FORWARD_NAMES);
        return unwrapDefault(exports);
      });
    } else if (typeof exports === "object") {
      factory(COMMONJS_ARGUMENTS);
      if (typeof module === "object") module.exports = unwrapDefault(exports);
    } else {
      (function() {
        var exports = {};
        factory(BROWSER_ARGUMENTS);
        GLOBAL_TO_ASSIGN;
      })();
    }
  })(
    typeof globalThis !== "undefined" ? globalThis
      : typeof self !== "undefined" ? self
      : this,
    function(IMPORT_NAMES) {
  })
`);

const transformModulesUmd = declare((api, options) => {
  api.assertVersion(7);

  const {
    globals,
    exactGlobals,
    loose,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
  } = options;

  /**
   * Build the assignment statements that initialize the UMD global.
   */
  function buildBrowserInit(
    browserGlobals,
    exactGlobals,
    filename,
    moduleName,
  ) {
    const moduleNameOrBasename = moduleName
      ? moduleName.value
      : basename(filename, extname(filename));
    let globalToAssign = t.memberExpression(
      t.identifier("global"),
      t.identifier(t.toIdentifier(moduleNameOrBasename)),
    );
    let initAssignments = [];

    if (exactGlobals) {
      const globalName = browserGlobals[moduleNameOrBasename];

      if (globalName) {
        initAssignments = [];

        const members = globalName.split(".");
        globalToAssign = members.slice(1).reduce(
          (accum, curr) => {
            initAssignments.push(
              buildPrerequisiteAssignment({
                GLOBAL_REFERENCE: t.cloneNode(accum),
              }),
            );
            return t.memberExpression(accum, t.identifier(curr));
          },
          t.memberExpression(t.identifier("global"), t.identifier(members[0])),
        );
      }
    }

    initAssignments.push(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          globalToAssign,
          t.callExpression(t.identifier("unwrapDefault"), [
            t.identifier("exports"),
          ]),
        ),
      ),
    );

    return initAssignments;
  }

  /**
   * Build the member expression that reads from a global for a given source.
   */
  function buildBrowserArg(browserGlobals, exactGlobals, source) {
    let memberExpression;
    if (exactGlobals) {
      const globalRef = browserGlobals[source];
      if (globalRef) {
        memberExpression = globalRef
          .split(".")
          .reduce(
            (accum, curr) => t.memberExpression(accum, t.identifier(curr)),
            t.identifier("global"),
          );
      } else {
        memberExpression = t.memberExpression(
          t.identifier("global"),
          t.identifier(t.toIdentifier(source)),
        );
      }
    } else {
      const requireName = basename(source, extname(source));
      const globalName = browserGlobals[requireName] || requireName;
      memberExpression = t.memberExpression(
        t.identifier("global"),
        t.identifier(t.toIdentifier(globalName)),
      );
    }
    return memberExpression;
  }

  return {
    name: "transform-modules-umd",

    visitor: {
      Program: {
        exit(path) {
          if (!isModule(path)) return;

          const browserGlobals = globals || {};

          let moduleName = getModuleName(this.file.opts, options);
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path,
            {
              loose,
              strict,
              strictMode,
              allowTopLevelThis,
              noInterop,
            },
          );

          const amdArgs = [];
          const commonjsArgs = [];
          const browserArgs = [];
          const importNames = [];
          const forwardNames = [];

          if (hasExports(meta)) {
            commonjsArgs.push(t.identifier("exports"));
            browserArgs.push(t.identifier("exports"));
            importNames.push(t.identifier(meta.exportName));
          }

          for (const [source, metadata] of meta.source) {
            amdArgs.push(t.stringLiteral(source));
            commonjsArgs.push(
              t.callExpression(t.identifier("require"), [
                t.stringLiteral(source),
              ]),
            );
            browserArgs.push(
              buildBrowserArg(browserGlobals, exactGlobals, source),
            );
            importNames.push(t.identifier(metadata.name));
            forwardNames.push(t.identifier(metadata.name));

            if (!isSideEffectImport(metadata)) {
              const interop = wrapInterop(
                path,
                t.identifier(metadata.name),
                metadata.interop,
              );
              if (interop) {
                const header = t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier(metadata.name),
                    interop,
                  ),
                );
                header.loc = meta.loc;
                headers.push(header);
              }
            }

            headers.push(
              ...buildNamespaceInitStatements(meta, metadata, loose),
            );
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);

          const { body, directives } = path.node;
          path.node.directives = [];
          path.node.body = [];
          const umdWrapper = path.pushContainer("body", [
            buildWrapper({
              // MODULE_NAME: moduleName,
              AMD_ARGUMENTS: t.arrayExpression(amdArgs),
              COMMONJS_ARGUMENTS: commonjsArgs,
              BROWSER_ARGUMENTS: browserArgs,
              IMPORT_NAMES: importNames,
              FORWARD_NAMES: forwardNames,
              GLOBAL_TO_ASSIGN: buildBrowserInit(
                browserGlobals,
                exactGlobals,
                this.filename || "unknown",
                moduleName,
              ),
            }),
          ])[0];
          const umdFactory = umdWrapper
            .get("expression.arguments")[1]
            .get("body");
          umdFactory.pushContainer("directives", directives);
          umdFactory.pushContainer("body", body);
        },
      },
    },
  };
});

export default function esm2umd(moduleName, esmCode, options = {}) {
  if (options.importInterop == null) options.noInterop = true;
  return (
    "// GENERATED FILE. DO NOT EDIT.\n" +
    transform(esmCode, {
      plugins: [[transformModulesUmd, options]],
      moduleId: moduleName,
    }).code.trim()
  );
}
