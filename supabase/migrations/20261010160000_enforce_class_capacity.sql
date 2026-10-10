-- Membuat fungsi validasi kapasitas
CREATE OR REPLACE FUNCTION public.check_class_capacity()
RETURNS trigger AS $$
DECLARE
  current_count INTEGER;
  max_capacity INTEGER;
BEGIN
  -- Dapatkan batas kapasitas dari program_variants via schedule_classes
  SELECT pv.system INTO max_capacity
  FROM public.schedule_classes sc
  JOIN public.program_variants pv ON sc.variant_id = pv.id
  WHERE sc.id = NEW.class_id;

  -- Jika max_capacity tidak ditemukan, izinkan saja (seharusnya tidak mungkin karena FK)
  IF max_capacity IS NULL THEN
    RETURN NEW;
  END IF;

  -- Hitung jumlah murid yang sudah ada di kelas tersebut, tidak termasuk row yang sedang diproses (jika UPDATE)
  SELECT COUNT(*) INTO current_count 
  FROM public.schedule_placements 
  WHERE class_id = NEW.class_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Batalkan transaksi jika penambahan ini akan melampaui kapasitas
  IF current_count >= max_capacity THEN
    RAISE EXCEPTION 'Kapasitas kelas penuh. Maksimal % murid untuk program ini.', max_capacity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Memasang pelatuk (trigger) pada tabel schedule_placements
DROP TRIGGER IF EXISTS enforce_class_capacity_trigger ON public.schedule_placements;
CREATE TRIGGER enforce_class_capacity_trigger
  BEFORE INSERT OR UPDATE OF class_id
  ON public.schedule_placements
  FOR EACH ROW
  EXECUTE FUNCTION public.check_class_capacity();
