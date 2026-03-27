package com.example.invoiceflow.service;

import com.example.invoiceflow.exception.ResourceNotFoundException;
import com.example.invoiceflow.model.Invoice;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 帳票出力サービス
 * PDF: Apache PDFBox / Excel: Apache POI
 */
@Service
public class ReportService {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * PDF帳票生成
     * @param invoiceId 帳票ID
     * @return PDFバイナリ
     */
    public byte[] generatePdf(String invoiceId) throws IOException {
        Invoice invoice = invoiceService.findById(invoiceId);

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float pageWidth = page.getMediaBox().getWidth();
                float margin = 50;

                // タイトル
                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.newLineAtOffset(margin, 780);
                cs.showText("Invoice");
                cs.endText();

                // 帳票番号
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, 755);
                cs.showText("Invoice Number: " + invoice.getInvoiceNumber());
                cs.endText();

                // 発行日・支払期限
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, 740);
                cs.showText("Issue Date: " + invoice.getIssueDate()
                        + "   Due Date: " + invoice.getDueDate());
                cs.endText();

                // 取引先
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, 720);
                cs.showText("To: " + invoice.getPartnerName());
                cs.endText();

                // 水平線
                cs.moveTo(margin, 710);
                cs.lineTo(pageWidth - margin, 710);
                cs.stroke();

                // 明細ヘッダー
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(margin, 695);
                cs.showText("Description");
                cs.endText();
                cs.beginText();
                cs.setFont(fontBold, 10);
                cs.newLineAtOffset(400, 695);
                cs.showText("Amount");
                cs.endText();

                // 明細行
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, 678);
                cs.showText(invoice.getDescription() != null ? invoice.getDescription() : "");
                cs.endText();
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(400, 678);
                cs.showText(String.format("JPY %,d", invoice.getAmount()));
                cs.endText();

                // 合計
                cs.moveTo(margin, 665);
                cs.lineTo(pageWidth - margin, 665);
                cs.stroke();

                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, 650);
                cs.showText("Tax (10%):");
                cs.endText();
                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(400, 650);
                cs.showText(String.format("JPY %,d", invoice.getTaxAmount()));
                cs.endText();

                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.newLineAtOffset(margin, 630);
                cs.showText("Total:");
                cs.endText();
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.newLineAtOffset(400, 630);
                cs.showText(String.format("JPY %,d", invoice.getTotalAmount()));
                cs.endText();
            }

            doc.save(out);
            return out.toByteArray();
        }
    }

    /**
     * Excel帳票生成
     * @param invoiceId 帳票ID
     * @return Excelバイナリ（.xlsx）
     */
    public byte[] generateExcel(String invoiceId) throws IOException {
        Invoice invoice = invoiceService.findById(invoiceId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Invoice");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // タイトル行
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("請求書");
            titleCell.setCellStyle(headerStyle);

            // 基本情報
            String[][] info = {
                {"帳票番号", invoice.getInvoiceNumber()},
                {"取引先", invoice.getPartnerName()},
                {"発行日", invoice.getIssueDate()},
                {"支払期限", invoice.getDueDate()},
                {"件名", invoice.getDescription()},
            };
            for (int i = 0; i < info.length; i++) {
                Row row = sheet.createRow(i + 2);
                row.createCell(0).setCellValue(info[i][0]);
                row.createCell(1).setCellValue(info[i][1] != null ? info[i][1] : "");
            }

            // 明細ヘッダー
            Row detailHeader = sheet.createRow(9);
            String[] headers = {"摘要", "税抜金額", "消費税(10%)", "税込合計"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = detailHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 明細データ
            Row detailRow = sheet.createRow(10);
            detailRow.createCell(0).setCellValue(invoice.getDescription() != null ? invoice.getDescription() : "");
            detailRow.createCell(1).setCellValue(invoice.getAmount());
            detailRow.createCell(2).setCellValue(invoice.getTaxAmount());
            detailRow.createCell(3).setCellValue(invoice.getTotalAmount());

            // 列幅自動調整
            for (int i = 0; i < 4; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
