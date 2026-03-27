package com.example.invoiceflow.controller;

import com.example.invoiceflow.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * 帳票出力 REST API コントローラー
 *
 * GET /api/reports/{id}/pdf    PDF帳票生成・ダウンロード
 * GET /api/reports/{id}/excel  Excel帳票生成・ダウンロード
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * PDF帳票ダウンロード
     * Apache PDFBox で帳票を生成しバイナリを返す
     */
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) throws IOException {
        byte[] pdf = reportService.generatePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoice-" + id + ".pdf\"")
                .body(pdf);
    }

    /**
     * Excel帳票ダウンロード
     * Apache POI で帳票を生成しバイナリを返す
     */
    @GetMapping("/{id}/excel")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable String id) throws IOException {
        byte[] excel = reportService.generateExcel(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoice-" + id + ".xlsx\"")
                .body(excel);
    }
}
