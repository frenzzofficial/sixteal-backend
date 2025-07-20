import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { envMailServicesConfig } from "./config.env";
import { EmailError } from "../errors/errors.app";

interface renderEmailTemplate_params {
  templateName: string;
  data: Record<string, any>;
}

export interface sendEmail_params {
  to: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
}

const transporter = nodemailer.createTransport({
  host: envMailServicesConfig.SMTP_HOST,
  port: envMailServicesConfig.SMTP_PORT,
  service: envMailServicesConfig.SMTP_SERVICE,
  auth: {
    user: envMailServicesConfig.SMTP_USER,
    pass: envMailServicesConfig.SMTP_PASSWORD,
  },
});

export const renderEmailTemplate = async (
  params: renderEmailTemplate_params
): Promise<string> => {
  const { templateName, data } = params;
  const templatePath = path.join(
    process.cwd(),
    "public",
    "email-templates",
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
};

export const sendEmail = async (params: sendEmail_params) => {
  const { to, subject, templateName, data } = params;
  const render_Params = { templateName, data };
  try {
    const html = await renderEmailTemplate(render_Params);
    await transporter.sendMail({
      from: `<${envMailServicesConfig.SMTP_USER}`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    throw new EmailError("failed to send email");
  }
};
