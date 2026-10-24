import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_HONOR = {
  "id": "honor",
  "title": "Membaca rekap honor",
  "articles": [
    {
      "slug": "honor-periode",
      "title": "Memeriksa periode, komponen, dan status honor",
      "summary": "Baca jumlah bersama bulan/statusnya. Estimasi, snapshot, dan status dibayar memiliki arti berbeda.",
      "keywords": [
        "honor",
        "gaji",
        "payroll",
        "take home pay",
        "minimum",
        "garansi",
        "tunjangan",
        "adjustment",
        "transfer",
        "periode"
      ],
      "prerequisites": [
        "Akun sendiri sudah dipastikan benar.",
        "Kartu mengajar yang dibahas diketahui kelas/tanggal dan statusnya."
      ],
      "groups": [
        {
          "id": "honor",
          "steps": [
            {
              "title": "Pilih Honor atau Rekap Honor Saya",
              "paragraphs": [
                "Buka Rekap Honor dan periksa bulan/tahun. Gunakan Pilih Periode Honor untuk pilihan yang tersedia bagi akun Anda; arsip yang tidak tersedia tidak otomatis dapat dibuka hanya dengan mengganti URL."
              ]
            },
            {
              "title": "Baca status sebelum membandingkan nominal",
              "paragraphs": [
                "Estimasi Berjalan masih dihitung dari data berjalan. Periode Ditutup / Menunggu Transfer menunjukkan rekap tertutup. Sudah Ditransfer / Paid adalah status pencatatan pembayaran oleh admin.",
                "Selalu cocokkan label bulan pada rekap dan pilihan periode, bukan hanya URL atau nama bulan yang diingat."
              ]
            },
            {
              "title": "Periksa komponen dan informasi minimum",
              "paragraphs": [
                "Baca Total Take-Home Pay, Total Fee Sesi, Tunjangan Tetap, rincian komponen, serta Penyesuaian (Adjustment) bila ditampilkan. Tanda positif menambah dan negatif mengurangi.",
                "Garansi Minimum Terdaftar adalah informasi yang dibaca terpisah dari total. Jangan menganggap nominal itu otomatis ditambahkan sebagai transaksi/top-up; bila jumlah tidak sesuai ketentuan yang disetujui, minta admin meninjau sebelum pembayaran."
              ]
            },
            {
              "title": "Laporkan perbedaan dengan rincian yang dapat ditelusuri",
              "paragraphs": [
                "Sampaikan bulan/status, kelas/tanggal kartu submitted, murid/status terkait, komponen, dan angka yang berbeda. Rekening Pencairan merupakan informasi akun; minta admin memeriksa perubahan data penerima melalui prosedur yang sah."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.honor
          ]
        }
      ],
      "expected": [
        "Anda memahami jumlah pada periode yang benar dan dapat menjelaskan selisih dengan data sumbernya."
      ],
      "systemRules": [
        "Fee sesi mengikuti kartu submitted dan nilai yang diakui; Hadir menggunakan fee snapshot, sementara Tidak Hadir/Izin/Cancel tidak menambah fee sesi standar saat ini.",
        "Total terdiri dari fee sesi, tunjangan tetap dan adjustment; informasi minimum terdaftar bukan bukti transfer atau komponen tambahan otomatis.",
        "Periode tertutup memakai snapshot, sedangkan estimasi masih berjalan.",
        "Guru membaca rekap sendiri dan tidak mengubah payroll, adjustment, atau status pembayaran dari halaman Honor."
      ],
      "recommendations": [
        "Status Paid bukan verifikasi mutasi rekening oleh aplikasi. Cocokkan penerimaan nyata dan laporkan jika belum sesuai.",
        "Jangan membagikan rincian honor atau rekening ke kanal publik."
      ],
      "troubleshooting": [
        {
          "question": "Arsip bulan yang dicari tidak tersedia.",
          "answer": "Gunakan pilihan yang benar-benar muncul untuk akun Anda dan periksa label rekap. Tanyakan ketersediaan/akses pernyataan periode itu kepada admin; jangan memakai tautan milik guru lain."
        },
        {
          "question": "Nominal minimum terdaftar lebih besar dari total.",
          "answer": "Bandingkan komponen dan ketentuan kompensasi dengan admin. Tampilan minimum bukan janji sistem menambah selisih secara otomatis; selesaikan pemeriksaan sebelum pembayaran."
        },
        {
          "question": "Kartu sudah dikirim tetapi fee tidak sesuai perkiraan.",
          "answer": "Periksa tanggal dalam periode, status Submitted, status kehadiran murid dan fee snapshot. Berikan detail sesi kepada admin; jangan mengubah kehadiran agar nominal naik."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
