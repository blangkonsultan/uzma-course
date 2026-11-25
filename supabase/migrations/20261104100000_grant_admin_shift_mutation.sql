-- Migration: 20261104100000_grant_admin_shift_mutation.sql
-- Goal: Grant INSERT, UPDATE, DELETE on public.branch_shifts to authenticated role
-- with existing Admins manage branch shifts policy enforcing public.is_admin()

GRANT INSERT, UPDATE, DELETE ON public.branch_shifts TO authenticated;
