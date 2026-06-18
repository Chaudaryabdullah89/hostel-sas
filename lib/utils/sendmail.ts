import nodemailer from "nodemailer";
import transporter from "./transpoter";
import { prisma } from "@/lib/prisma";
import { getCurrentTenantId } from "@/lib/tenant";

export interface SendEmailOptions {
    to: string;
    bcc?: string;
    subject: string;
    html: string;
    tenantId?: string;
}

export async function sendEmail({ to, bcc, subject, html, tenantId }: SendEmailOptions) {
    let fromName = "Hostel Management";
    try {
        // Hard kill-switch via env for emergency shutdowns.
        if (process.env.DISABLE_EMAILS === "true") {
            console.warn(`[Mailer] Blocked by DISABLE_EMAILS=true. To: ${to}, Subject: ${subject}`);
            return { skipped: true, reason: "env-disabled" };
        }

        // Determine tenant context
        let resolvedTenantId = tenantId || null;
        if (!resolvedTenantId) {
            try {
                resolvedTenantId = await getCurrentTenantId();
            } catch (err) {
                // Not in next.js request context (e.g. cron, test, script)
            }
        }

        let settings: any = null;
        if (resolvedTenantId) {
            try {
                settings = await prisma.systemSettings.findFirst({
                    where: { tenantId: resolvedTenantId },
                });
            } catch (settingsErr) {
                console.warn(`[Mailer] Could not read tenant system settings for tenant ${resolvedTenantId}:`, settingsErr);
            }
        } else {
            try {
                settings = await prisma.systemSettings.findUnique({
                    where: { id: "global" },
                });
            } catch (settingsErr) {
                console.warn("[Mailer] Could not read global/default system settings.");
            }
        }

        const hasCustomSmtp = settings?.smtpHost && settings?.smtpUser && settings?.smtpPass;

        if (resolvedTenantId) {
            if (hasCustomSmtp) {
                if (settings.enableEmailService === false) {
                    console.warn(`[Mailer] Blocked by system setting enableEmailService=false for tenant ${resolvedTenantId}. To: ${to}, Subject: ${subject}`);
                    return { skipped: true, reason: "settings-disabled" };
                }
                if (settings.companyName) {
                    fromName = settings.companyName;
                }

                const customTransporter = nodemailer.createTransport({
                    host: settings.smtpHost,
                    port: Number(settings.smtpPort) || 587,
                    secure: settings.smtpSecure === true,
                    auth: {
                        user: settings.smtpUser,
                        pass: settings.smtpPass,
                    },
                });

                const fromAddress = settings.smtpFrom || settings.smtpUser;
                const info = await customTransporter.sendMail({
                    from: `"${fromName}" <${fromAddress}>`,
                    to,
                    bcc,
                    subject,
                    html,
                });
                return info;
            } else {
                console.warn(`[Mailer] Tenant ${resolvedTenantId} has not configured SMTP credentials. Skipping email delivery.`);
                return { skipped: true, reason: "tenant-smtp-not-configured" };
            }
        } else {
            // Fallback to global env-based SMTP
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.warn("[Mailer] No tenant context and missing global EMAIL_USER/EMAIL_PASS. Skipping email.");
                return { skipped: true, reason: "smtp-not-configured" };
            }

            if (settings?.enableEmailService === false) {
                console.warn(`[Mailer] Blocked by system setting enableEmailService=false. To: ${to}, Subject: ${subject}`);
                return { skipped: true, reason: "settings-disabled" };
            }
            if (settings?.companyName) {
                fromName = settings.companyName;
            }

            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.EMAIL_USER}>`,
                to,
                bcc,
                subject,
                html,
            });
            return info;
        }
    } catch (error: any) {
        console.error("Error sending email:", error);
        return { skipped: true, reason: "send-failed", error: error?.message };
    }
}
