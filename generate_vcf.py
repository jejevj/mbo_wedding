#!/usr/bin/env python3
"""
generate_vcf.py
---------------
Script Python untuk membuat file VCF (vCard) dari daftar tamu.

Cara pakai:
  # Generate dari tamu.json (default)
  python generate_vcf.py

  # Tentukan file input dan output
  python generate_vcf.py --input backend/tamu.json --output tamu_undangan.vcf

  # Tambah kontak manual langsung dari CLI
  python generate_vcf.py --tambah "Bapak Andi" 08123456789
  python generate_vcf.py --tambah "Ibu Sari"   (tanpa nomor WA)
"""

import json
import argparse
import os
import sys
from datetime import datetime

DEFAULT_INPUT  = os.path.join(os.path.dirname(__file__), 'backend', 'tamu.json')
DEFAULT_OUTPUT = 'tamu_mbo_wedding.vcf'


def baca_tamu(filepath: str) -> list[dict]:
    """Baca daftar tamu dari file JSON."""
    if not os.path.exists(filepath):
        print(f'[!] File tidak ditemukan: {filepath}')
        return []
    with open(filepath, encoding='utf-8') as f:
        return json.load(f)


def tulis_tamu(filepath: str, data: list[dict]) -> None:
    """Simpan daftar tamu ke file JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'[+] tamu.json diperbarui: {filepath}')


def normalisasi_nomor(nomor: str) -> str:
    """Normalisasi nomor WA ke format +62xxx."""
    nomor = nomor.strip().replace(' ', '').replace('-', '')
    if nomor.startswith('0'):
        nomor = '+62' + nomor[1:]
    elif nomor.startswith('62') and not nomor.startswith('+'):
        nomor = '+' + nomor
    return nomor


def buat_vcard(nama: str, wa: str = '') -> str:
    """Generate satu blok vCard 3.0 untuk satu kontak."""
    lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        f'FN:{nama}',
        f'N:{nama};;;;',
    ]
    if wa:
        tel = normalisasi_nomor(wa)
        lines.append(f'TEL;TYPE=CELL:{tel}')
    lines.append('NOTE:Tamu Undangan MBO Wedding')
    lines.append(f'REV:{datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")}')
    lines.append('END:VCARD')
    return '\r\n'.join(lines)


def generate_vcf(tamu_list: list[dict], output_path: str) -> None:
    """Generate file .vcf dari daftar tamu."""
    if not tamu_list:
        print('[!] Daftar tamu kosong, file VCF tidak dibuat.')
        return

    vcf_blocks = [buat_vcard(t['nama'], t.get('wa', '')) for t in tamu_list]
    isi = '\r\n\r\n'.join(vcf_blocks) + '\r\n'

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(isi)

    print(f'[+] VCF berhasil dibuat: {output_path}')
    print(f'    Jumlah kontak : {len(tamu_list)}')
    print(f'    Ukuran file   : {os.path.getsize(output_path):,} bytes')


def tambah_tamu_manual(filepath: str, nama: str, wa: str = '') -> dict:
    """Tambah satu tamu ke tamu.json dari CLI."""
    data = baca_tamu(filepath) if os.path.exists(filepath) else []

    # Cek duplikat
    if any(t['nama'].lower() == nama.lower() for t in data):
        print(f'[!] Tamu "{nama}" sudah ada di daftar.')
        return {}

    max_id = max((t['id'] for t in data), default=0)
    tamu_baru = {
        'id': max_id + 1,
        'nama': nama,
        'wa': wa,
        'created_at': datetime.utcnow().isoformat() + 'Z'
    }
    data.append(tamu_baru)
    tulis_tamu(filepath, data)
    print(f'[+] Tamu ditambahkan: {nama} ({wa or "tanpa nomor"})')
    return tamu_baru


def main():
    parser = argparse.ArgumentParser(
        description='Generator VCF untuk tamu undangan MBO Wedding'
    )
    parser.add_argument('--input',  '-i', default=DEFAULT_INPUT,
                        help=f'Path ke tamu.json (default: {DEFAULT_INPUT})')
    parser.add_argument('--output', '-o', default=DEFAULT_OUTPUT,
                        help=f'Nama file output .vcf (default: {DEFAULT_OUTPUT})')
    parser.add_argument('--tambah', '-t', nargs='+', metavar=('NAMA', 'NOMOR'),
                        help='Tambah tamu manual: --tambah "Nama Tamu" 08123456789')
    parser.add_argument('--no-generate', action='store_true',
                        help='Hanya tambah ke JSON, jangan generate VCF')
    args = parser.parse_args()

    # Mode tambah manual
    if args.tambah:
        nama = args.tambah[0]
        wa   = args.tambah[1] if len(args.tambah) > 1 else ''
        tambah_tamu_manual(args.input, nama, wa)
        if args.no_generate:
            return

    # Generate VCF
    tamu_list = baca_tamu(args.input)
    if not tamu_list:
        print('[!] Tidak ada tamu untuk di-export. Tambahkan tamu terlebih dahulu.')
        sys.exit(1)

    generate_vcf(tamu_list, args.output)
    print()
    print('Contoh cara import ke HP Android:')
    print('  1. Pindahkan file .vcf ke HP lewat USB / Google Drive / WhatsApp')
    print('  2. Buka file .vcf → Simpan ke Kontak')


if __name__ == '__main__':
    main()
