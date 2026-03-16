"use client";

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { 
  ChevronRight, ArrowUpDown, Search, 
  Phone, Mail, MessageCircle, MoreVertical,
  Building2, User
} from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  companies: {
    name: string;
  } | null;
  created_at: string;
}

const columnHelper = createColumnHelper<Contact>();

export default function ContactsTable({ data }: { data: Contact[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => [
    columnHelper.accessor(row => `${row.first_name} ${row.last_name}`, {
      id: 'name',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Contact <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      ),
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {info.row.original.first_name[0]}{info.row.original.last_name?.[0] || ''}
          </div>
          <div>
            <div className="font-bold text-slate-900">{info.getValue()}</div>
            <div className="text-[10px] text-slate-500">{info.row.original.job_title}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('companies.name', {
      header: 'Company',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 className="w-3.5 h-3.5" />
          {info.getValue() || <span className="text-slate-400 italic">No Company</span>}
        </div>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex items-center justify-end gap-2">
          <Link 
            href={`/admin/contacts/${info.row.original.id}`}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-slate-500 mr-2">
            {data.length} Total Contacts
          </div>
          <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Actual Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-100">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-50">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
