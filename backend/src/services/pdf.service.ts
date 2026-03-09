import PDFDocument from "pdfkit";
import { Quotation } from "../models/Quotation";
import { QuotationItem } from "../models/QuotationItem";
import { Client } from "../models/Client";
import { Company } from "../models/Company";

interface QuotationWithRelations extends Quotation {
  client: Client;
  company: Company;
  items: QuotationItem[];
}

// ── Color palette (light theme matching dashboard) ──
const colors = {
  white: "#ffffff",
  pageBg: "#f9fafb",
  cardBg: "#ffffff",
  purple: "#9333ea",
  purpleDark: "#7c3aed",
  purpleLight: "#a855f7",
  purpleSoft: "#f3e8ff",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  success: "#059669",
  blue: "#2563eb",
  red: "#dc2626",
  tableHeaderBg: "#7c3aed",
  tableRowAlt: "#faf5ff",
};

const PAGE_W = 595.28; // A4 width
const PAGE_H = 841.89; // A4 height
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

export const generateQuotationPdf = (
  quotation: QuotationWithRelations,
): PDFKit.PDFDocument => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    bufferPages: true,
  });

  // ══════════════════════════════════════════
  //  BACKGROUND — clean white page
  // ══════════════════════════════════════════
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(colors.white);

  // ══════════════════════════════════════════
  //  DECORATIVE TOP BAR — purple gradient strip
  // ══════════════════════════════════════════
  const topGrad = doc.linearGradient(0, 0, PAGE_W, 0);
  topGrad.stop(0, "#7c3aed");
  topGrad.stop(0.5, "#9333ea");
  topGrad.stop(1, "#7c3aed");
  doc.rect(0, 0, PAGE_W, 6).fill(topGrad);

  // ══════════════════════════════════════════
  //  HEADER SECTION
  // ══════════════════════════════════════════
  let y = 40;

  // Company name
  doc.fillColor(colors.textPrimary).fontSize(26).font("Helvetica-Bold");
  doc.text(quotation.company.name, MARGIN, y, { width: CONTENT_W });
  y += 35;

  // Company details line
  doc.fontSize(9).font("Helvetica").fillColor(colors.textSecondary);
  const companyDetails = [quotation.company.email];
  if (quotation.company.phone) companyDetails.push(quotation.company.phone);
  if (quotation.company.address) companyDetails.push(quotation.company.address);
  doc.text(companyDetails.join("  |  "), MARGIN, y, { width: CONTENT_W });
  y += 25;

  // Divider line with purple accent
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + 60, y)
    .lineWidth(3)
    .strokeColor(colors.purple)
    .stroke();
  doc
    .moveTo(MARGIN + 65, y)
    .lineTo(PAGE_W - MARGIN, y)
    .lineWidth(0.5)
    .strokeColor(colors.border)
    .stroke();
  y += 25;

  // ══════════════════════════════════════════
  //  QUOTATION TITLE + META — two column layout
  // ══════════════════════════════════════════
  // Left side: Quotation title
  doc.fillColor(colors.purpleDark).fontSize(12).font("Helvetica-Bold");
  doc.text("ORÇAMENTO", MARGIN, y, { width: CONTENT_W / 2 });
  y += 18;

  doc.fillColor(colors.textPrimary).fontSize(28).font("Helvetica-Bold");
  doc.text(`#${String(quotation.id).padStart(4, "0")}`, MARGIN, y, {
    width: CONTENT_W / 2,
  });

  // Right side: Meta info (date, status)
  const metaX = PAGE_W / 2 + 30;
  const metaW = PAGE_W - MARGIN - metaX;
  let metaY = y - 18;

  const drawMetaRow = (
    label: string,
    value: string,
    valueColor = colors.textPrimary,
  ) => {
    doc.fillColor(colors.textMuted).fontSize(8).font("Helvetica");
    doc.text(label.toUpperCase(), metaX, metaY, { width: metaW });
    metaY += 12;
    doc.fillColor(valueColor).fontSize(11).font("Helvetica-Bold");
    doc.text(value, metaX, metaY, { width: metaW });
    metaY += 20;
  };

  drawMetaRow(
    "Data",
    new Date(quotation.createdAt).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const statusColor =
    quotation.status === "accepted"
      ? colors.success
      : quotation.status === "sent"
        ? colors.blue
        : quotation.status === "rejected"
          ? colors.red
          : colors.textSecondary;
  const statusLabels: Record<string, string> = {
    draft: "RASCUNHO",
    sent: "ENVIADO",
    accepted: "ACEITO",
    rejected: "REJEITADO",
  };
  drawMetaRow("Status", statusLabels[quotation.status] || quotation.status.toUpperCase(), statusColor);

  y += 45;

  // ══════════════════════════════════════════
  //  CLIENT CARD — rounded box
  // ══════════════════════════════════════════
  y += 15;
  const clientCardH = 85;

  // Card background with subtle border
  doc.roundedRect(MARGIN, y, CONTENT_W, clientCardH, 8).fill(colors.pageBg);
  doc
    .roundedRect(MARGIN, y, CONTENT_W, clientCardH, 8)
    .lineWidth(0.5)
    .strokeColor(colors.border)
    .stroke();
  // Left purple accent bar
  doc.roundedRect(MARGIN, y, 4, clientCardH, 2).fill(colors.purple);

  const clientX = MARGIN + 20;
  let clientY = y + 14;

  doc.fillColor(colors.textMuted).fontSize(8).font("Helvetica");
  doc.text("COBRAR DE", clientX, clientY, { width: CONTENT_W - 40 });
  clientY += 14;

  doc.fillColor(colors.textPrimary).fontSize(14).font("Helvetica-Bold");
  doc.text(quotation.client.name, clientX, clientY, { width: CONTENT_W - 40 });
  clientY += 20;

  doc.fillColor(colors.textSecondary).fontSize(9).font("Helvetica");
  const clientInfo = [];
  if (quotation.client.email) clientInfo.push(quotation.client.email);
  if (quotation.client.phone) clientInfo.push(quotation.client.phone);
  if (clientInfo.length > 0) {
    doc.text(clientInfo.join("  |  "), clientX, clientY, {
      width: CONTENT_W - 40,
    });
    clientY += 14;
  }
  if (quotation.client.address) {
    doc.text(quotation.client.address, clientX, clientY, {
      width: CONTENT_W - 40,
    });
  }

  y += clientCardH + 25;

  // ══════════════════════════════════════════
  //  ITEMS TABLE — wider spacing for Unit Price & Total
  // ══════════════════════════════════════════
  const colDesc = MARGIN + 15;
  const colQty = 310;
  const colUnit = 375;
  const colTotal = 460;
  const colTotalEnd = PAGE_W - MARGIN - 15;
  const rowH = 32;

  // Table header background
  doc.roundedRect(MARGIN, y, CONTENT_W, rowH, 6).fill(colors.tableHeaderBg);

  doc.fillColor(colors.white).fontSize(8).font("Helvetica-Bold");
  const headerY = y + 11;
  doc.text("DESCRIÇÃO", colDesc, headerY, { width: 180 });
  doc.text("QTD", colQty, headerY, { width: 50, align: "center" });
  doc.text("PREÇO UNIT.", colUnit, headerY, { width: 75, align: "right" });
  doc.text("TOTAL", colTotal, headerY, { width: colTotalEnd - colTotal, align: "right" });

  y += rowH;

  // Table rows
  quotation.items.forEach((item, index) => {
    const isAlt = index % 2 === 0;
    const bgColor = isAlt ? colors.white : colors.tableRowAlt;

    // Row background — round bottom corners on last row
    const isLast = index === quotation.items.length - 1;
    if (isLast) {
      doc.roundedRect(MARGIN, y, CONTENT_W, rowH, 6).fill(bgColor);
      // Cover top corners
      doc.rect(MARGIN, y, CONTENT_W, 6).fill(bgColor);
    } else {
      doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bgColor);
    }

    // Bottom border for each row
    if (!isLast) {
      doc
        .moveTo(MARGIN, y + rowH)
        .lineTo(PAGE_W - MARGIN, y + rowH)
        .lineWidth(0.5)
        .strokeColor(colors.borderLight)
        .stroke();
    }

    const rowY = y + 10;
    doc.fillColor(colors.textPrimary).fontSize(9).font("Helvetica");
    doc.text(item.description, colDesc, rowY, { width: 180 });
    doc.fillColor(colors.textSecondary);
    doc.text(String(item.quantity), colQty, rowY, {
      width: 50,
      align: "center",
    });
    doc.text(formatCurrency(Number(item.unitPrice)), colUnit, rowY, {
      width: 75,
      align: "right",
    });
    doc.fillColor(colors.textPrimary).font("Helvetica-Bold");
    doc.text(formatCurrency(Number(item.totalPrice)), colTotal, rowY, {
      width: colTotalEnd - colTotal,
      align: "right",
    });

    y += rowH;
  });

  // Table outer border
  const tableH = rowH + quotation.items.length * rowH;
  doc
    .roundedRect(MARGIN, y - quotation.items.length * rowH - rowH, CONTENT_W, tableH, 6)
    .lineWidth(0.5)
    .strokeColor(colors.border)
    .stroke();

  // ══════════════════════════════════════════
  //  TOTAL SECTION — right aligned box
  // ══════════════════════════════════════════
  y += 20;
  const totalBoxW = 220;
  const totalBoxX = PAGE_W - MARGIN - totalBoxW;

  // Subtotal
  doc.fillColor(colors.textMuted).fontSize(9).font("Helvetica");
  doc.text("Subtotal", totalBoxX, y, { width: totalBoxW - 90, align: "right" });
  doc.fillColor(colors.textSecondary).font("Helvetica");
  doc.text(
    formatCurrency(Number(quotation.totalPrice)),
    totalBoxX + totalBoxW - 85,
    y,
    { width: 85, align: "right" },
  );
  y += 20;

  // Divider
  doc
    .moveTo(totalBoxX, y)
    .lineTo(totalBoxX + totalBoxW, y)
    .lineWidth(0.5)
    .strokeColor(colors.border)
    .stroke();
  y += 12;

  // Grand total box
  const totalHighlightH = 40;
  doc
    .roundedRect(totalBoxX, y, totalBoxW, totalHighlightH, 8)
    .fill(colors.purpleDark);
  doc.fillColor("#ffffffcc").fontSize(9).font("Helvetica");
  doc.text("TOTAL", totalBoxX + 18, y + 14, { width: 60 });
  doc.fillColor(colors.white).fontSize(18).font("Helvetica-Bold");
  doc.text(
    formatCurrency(Number(quotation.totalPrice)),
    totalBoxX + 80,
    y + 10,
    {
      width: totalBoxW - 100,
      align: "right",
    },
  );

  y += totalHighlightH + 30;

  // ══════════════════════════════════════════
  //  NOTES SECTION
  // ══════════════════════════════════════════
  if (quotation.notes) {
    doc.roundedRect(MARGIN, y, CONTENT_W, 70, 8).fill(colors.pageBg);
    doc
      .roundedRect(MARGIN, y, CONTENT_W, 70, 8)
      .lineWidth(0.5)
      .strokeColor(colors.border)
      .stroke();
    doc.roundedRect(MARGIN, y, 4, 70, 2).fill(colors.purpleLight);

    doc.fillColor(colors.textMuted).fontSize(8).font("Helvetica");
    doc.text("OBSERVAÇÕES", MARGIN + 20, y + 12, { width: CONTENT_W - 40 });
    doc.fillColor(colors.textSecondary).fontSize(9).font("Helvetica");
    doc.text(quotation.notes, MARGIN + 20, y + 26, { width: CONTENT_W - 40 });

    y += 85;
  }

  // ══════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════
  const footerY = PAGE_H - 50;

  // Footer divider
  doc
    .moveTo(MARGIN, footerY - 15)
    .lineTo(PAGE_W - MARGIN, footerY - 15)
    .lineWidth(0.5)
    .strokeColor(colors.border)
    .stroke();

  doc.fillColor(colors.textMuted).fontSize(7).font("Helvetica");
  doc.text(
    `Gerado por L9 Orçamento  |  ${quotation.company.name}  |  ${new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}`,
    MARGIN,
    footerY,
    { width: CONTENT_W, align: "center" },
  );

  doc.fillColor(colors.purpleDark).fontSize(7);
  doc.text("l9orcamento.com", MARGIN, footerY + 12, {
    width: CONTENT_W,
    align: "center",
  });

  doc.end();
  return doc;
};

function formatCurrency(value: number): string {
  return `R$${value.toFixed(2)}`;
}
