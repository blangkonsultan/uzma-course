-- Update gallery section in landing_content to include all 17 activity photos in "Kegiatan Guru dan Murid"
UPDATE public.landing_content
SET content = jsonb_set(
  content,
  '{groups,1,images}',
  '[
    {
      "alt": "Suasana Belajar Membaca dan Menulis Murid Uzma Course",
      "url": "https://lh3.googleusercontent.com/d/1qxMtNx5uoEQ20DzfoqppXf86K0vE-q5o"
    },
    {
      "alt": "Pendampingan Belajar Intensif Guru dan Murid",
      "url": "https://lh3.googleusercontent.com/d/1PdA3rD7-xCfwaP2mNqLdJu__ZGojW-Yj"
    },
    {
      "alt": "Kegiatan Belajar Ceria dan Interaktif Ahe SumoWangi",
      "url": "https://lh3.googleusercontent.com/d/1wT5HcJzIWVtJ7pO-j12YtjQPaAEp4EO4"
    },
    {
      "alt": "Bimbingan Personal Guru Ramah Anak Uzma Course",
      "url": "https://lh3.googleusercontent.com/d/1-BCVm72iftqlfUxmX5wbvJ6AcxYmWxXK"
    },
    {
      "alt": "Aktivitas Belajar Calistung Murid Ahe",
      "url": "https://lh3.googleusercontent.com/d/19MD-QiC7AsqT-hY_ZI76X0U1qjpuTDxY"
    },
    {
      "alt": "Momen Interaksi Hangat Guru dan Murid di Kelas",
      "url": "https://lh3.googleusercontent.com/d/1lCDKwOnUx0GiiJhNu8GmUaiWhybR6VbM"
    },
    {
      "alt": "Pendampingan Belajar Membaca Bebas Tekanan",
      "url": "https://lh3.googleusercontent.com/d/15g32EE_VL4F7QwiipQzM8xfnmRYynv1a"
    },
    {
      "alt": "Keceriaan Murid Belajar Bersama Guru Uzma Course",
      "url": "https://lh3.googleusercontent.com/d/1WR-98MwiLYhvavy7ShM5XFiVbvfWlr4G"
    },
    {
      "alt": "Fokus Belajar dan Latihan Membaca Anak Hebat",
      "url": "https://lh3.googleusercontent.com/d/1Nldhm7raWV_8fBcr2l1zc6UIrwPNv7XP"
    },
    {
      "alt": "Suasana Kelas Bimbingan Belajar Ramah Anak",
      "url": "https://lh3.googleusercontent.com/d/1QKfz9CL3Z32qTZGy1KI72dPQxFlrL9xT"
    },
    {
      "alt": "Guru Mendampingi Proses Belajar Murid dengan Sabar",
      "url": "https://lh3.googleusercontent.com/d/1p4iz9ZM12I9eoHBAXFcavxhhsVP-q8W9"
    },
    {
      "alt": "Aktivitas Belajar Menyenangkan di Uzma Course",
      "url": "https://lh3.googleusercontent.com/d/1RMXfN2_aMPldIVN6uZeg0SGgZuNUzTWf"
    },
    {
      "alt": "Dokumentasi Pendampingan Privat dan Semi Privat",
      "url": "https://lh3.googleusercontent.com/d/1BOkaAz_GXY58MaTF3SR7ehcouYtk2d2_"
    },
    {
      "alt": "Kegiatan Belajar dan Praktek Membaca Murid",
      "url": "https://lh3.googleusercontent.com/d/1BNp44_xBGeXUSlzAkIr6OCOrm1ZOZ1Gk"
    },
    {
      "alt": "Keceriaan dan Semangat Belajar Murid Ahe SumoWangi",
      "url": "https://lh3.googleusercontent.com/d/18IWKSVA87rxU4yir7Jnje_z1KtP8iTow"
    },
    {
      "alt": "Potret Kebersamaan Guru dan Murid di Ruang Belajar",
      "url": "https://lh3.googleusercontent.com/d/1HRK0IvSRTUIxZUnRG_vhqkqD1vp_lisZ"
    },
    {
      "alt": "Dokumentasi Kegiatan Belajar dan Wisuda Ahe SumoWangi",
      "url": "https://lh3.googleusercontent.com/d/1_CoeVyfr8MwT7_NdXxUxRhYMmYU0wtmw"
    }
  ]'::jsonb
)
WHERE section = 'gallery';
