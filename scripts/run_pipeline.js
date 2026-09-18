#!/usr/bin/env node

/**
 * ==============================================================================
 * TECNOFILM ERP - MASTER CI/CD AUTOMATED PIPELINE SUITE
 * ==============================================================================
 * Orchestrates complete end-to-end testing across backend and frontend:
 *   [1/4] Frontend Static Analysis & Dead Code Verification (ESLint)
 *   [2/4] Backend Unit, Model & Database Pipeline (PHP)
 *   [3/4] E2E API & HTTP Routing Integration Pipeline (PHP/HTTP)
 *   [4/4] Frontend Production Build & Bundle Compilation (Vite)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

// ANSI Color codes
const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    bgBlue: "\x1b[44m",
};

function logHeader(text) {
    console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║${text.padStart(38 + Math.floor(text.length / 2)).padEnd(76)}║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
}

function runCommand(name, command, args, cwd) {
    return new Promise((resolve) => {
        const start = Date.now();
        console.log(`${colors.bold}${colors.blue}▶ EXECUTING:${colors.reset} ${name} ${colors.dim}(${command} ${args.join(' ')})${colors.reset}`);
        
        const fullCommand = args && args.length > 0 ? `${command} ${args.join(' ')}` : command;
        const proc = spawn(fullCommand, {
            cwd,
            shell: true,
            stdio: 'inherit',
            env: { ...process.env, FORCE_COLOR: '1' }
        });

        proc.on('close', (code) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            if (code === 0) {
                console.log(`${colors.green}${colors.bold}✓ PASSED:${colors.reset} ${name} ${colors.dim}(${duration}s)${colors.reset}\n`);
                resolve({ name, success: true, duration, code });
            } else {
                console.log(`${colors.red}${colors.bold}✗ FAILED:${colors.reset} ${name} with exit code ${code} ${colors.dim}(${duration}s)${colors.reset}\n`);
                resolve({ name, success: false, duration, code });
            }
        });

        proc.on('error', (err) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            console.error(`${colors.red}${colors.bold}✗ ERROR:${colors.reset} ${name} - ${err.message}\n`);
            resolve({ name, success: false, duration, code: 1, error: err.message });
        });
    });
}

async function main() {
    const suiteStart = Date.now();
    logHeader("TECNOFILM ERP - MASTER CI/CD PIPELINE SUITE");

    console.log(`${colors.dim}Target Root Directory:${colors.reset} ${rootDir}`);
    console.log(`${colors.dim}Backend Directory:    ${colors.reset} ${backendDir}`);
    console.log(`${colors.dim}Frontend Directory:   ${colors.reset} ${frontendDir}\n`);

    const stages = [
        {
            num: 1,
            name: "Frontend Code Quality & Dead Code Scan (ESLint)",
            command: "npx",
            args: ["eslint", "."],
            cwd: frontendDir,
        },
        {
            num: 2,
            name: "Backend Unit, Model & Database Pipeline (PHP)",
            command: "php",
            args: ["tests/pipeline_backend.php"],
            cwd: backendDir,
        },
        {
            num: 3,
            name: "E2E API Endpoints & RBAC Security Pipeline (PHP/HTTP)",
            command: "php",
            args: ["tests/pipeline_api.php"],
            cwd: backendDir,
        },
        {
            num: 4,
            name: "Frontend Production Build & Asset Optimization (Vite)",
            command: "npm",
            args: ["run", "build"],
            cwd: frontendDir,
        }
    ];

    const results = [];

    for (const stage of stages) {
        console.log(`${colors.bold}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}${colors.magenta}[PIPELINE STAGE ${stage.num}/4] ${stage.name}${colors.reset}`);
        console.log(`${colors.bold}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        
        const res = await runCommand(stage.name, stage.command, stage.args, stage.cwd);
        results.push(res);

        // Fail fast if critical stage fails
        if (!res.success) {
            console.error(`${colors.yellow}⚠️ Pipeline halted due to failure in stage: ${stage.name}${colors.reset}\n`);
            break;
        }
    }

    const totalDuration = ((Date.now() - suiteStart) / 1000).toFixed(2);
    const allPassed = results.length === stages.length && results.every(r => r.success);

    console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}                         MASTER PIPELINE SCORECARD                          ${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}════════════════════════════════════════════════════════════════════════════${colors.reset}`);
    
    results.forEach((r, idx) => {
        const icon = r.success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
        const name = `Stage ${idx + 1}: ${r.name}`;
        const time = `${colors.dim}${r.duration}s${colors.reset}`;
        console.log(`  ${icon}  ${name.padEnd(55)} ${time}`);
    });

    console.log(`${colors.dim}────────────────────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`  ${colors.bold}Total Execution Time:${colors.reset} ${colors.cyan}${totalDuration}s${colors.reset}`);
    console.log(`  ${colors.bold}Stages Completed:    ${colors.reset} ${results.filter(r => r.success).length}/${stages.length}`);

    if (allPassed) {
        console.log(`\n${colors.green}${colors.bold}🎉 ALL PIPELINES PASSED! APPLICATION IS HEALTHY FROM BACKEND TO FRONTEND.${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}${colors.bold}❌ PIPELINE FAILED. Please review the output above for failure details.${colors.reset}\n`);
        process.exit(1);
    }
}

main();
