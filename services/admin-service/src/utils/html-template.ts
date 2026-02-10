import fs from "fs";
import Handlebars from "handlebars";
import path from "path";
import { DashboardViewModel, LoginViewModel } from "../models/types";



class HtmlTemplate {

    private registerHelpers(): void {
        // dateTime formatted
        Handlebars.registerHelper("formatTime", (iso: string) => {
            if (!iso) return "";
            const date = new Date(iso);

            return date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        });

        // for runtime 
        Handlebars.registerHelper("formatDuration", (seconds: number) => {
            if (typeof seconds !== "number" || Number.isNaN(seconds)) return "";

            const s = Math.max(0, Math.floor(seconds));
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;

            if (h > 0) return `${h}h ${m}m ${sec}s`;
            if (m > 0) return `${m}m ${sec}s`;
            return `${sec}s`;
        });

        Handlebars.registerHelper("rtClass", (ms?: number) => {
            if (typeof ms !== "number" || Number.isNaN(ms)) return "rt-unknown";
            if (ms >= 200) return "rt-slow";
            if (ms >= 50) return "rt-medium";
            return "rt-fast";
        });

        Handlebars.registerHelper("toJson", (value: unknown) => JSON.stringify(value));

    }

    public loadTemplate(fileName: string): string {
        const distPath = path.join(process.cwd(), "dist", "templates", fileName);
        const srcPath = path.join(process.cwd(), "src", "templates", fileName);
        const isDev = process.env.NODE_ENV !== "production";
        const fullPath = isDev && fs.existsSync(srcPath) ? srcPath : (fs.existsSync(distPath) ? distPath : srcPath);
        return fs.readFileSync(fullPath, "utf-8");
    }

    private loadSharedCss(): string { return this.loadTemplate("shared.css"); }

    public renderAdminPanel(view: DashboardViewModel): string {
        this.registerHelpers();
        const templateSource = this.loadTemplate("admin.hbs");
        const sharedCss = this.loadSharedCss();
        const serviceCss = this.loadTemplate("admin.css");
        const css = `${sharedCss}\n\n${serviceCss}`;

        const template = Handlebars.compile(templateSource);
        const nginxOk = view.services?.find((s: { name: string }) => s.name === "nginx")?.ok ?? false;

        return template({ ...view, css, nginxOk });
    }

    public renderLoginPage(view: LoginViewModel): string {
        this.registerHelpers();

        const templateSource = this.loadTemplate("login.hbs");
        const sharedCss = this.loadSharedCss();
        const serviceCss = this.loadTemplate("login.css");
        const css = `${sharedCss}\n\n${serviceCss}`;

        const template = Handlebars.compile(templateSource);
        return template({ ...view, css });
    }

}

export const htmlTemplate = new HtmlTemplate();
