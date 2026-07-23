import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const PAGE_SIZE = 8;

/**
 * Generic list + CRUD hook for a single Supabase table.
 *
 * @param {string} table - table name
 * @param {string[]} searchColumns - text columns to match against `search` (ILIKE, OR'd together)
 * @param {string} selectQuery - the select() string (supports relational embeds, e.g. "*, customers(name)")
 */
export function useCrudTable(table, { searchColumns = [], selectQuery = "*" } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");

    let query = supabase.from(table).select(selectQuery, { count: "exact" });

    if (search.trim() && searchColumns.length > 0) {
      const orClause = searchColumns.map((col) => `${col}.ilike.%${search.trim()}%`).join(",");
      query = query.or(orClause);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error: fetchError, count } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, selectQuery, search, JSON.stringify(filters), page]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Reset to page 1 whenever the search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, JSON.stringify(filters)]);

  const createRow = async (payload) => {
    const { data, error: insertError } = await supabase.from(table).insert(payload).select().single();
    if (!insertError) await fetchRows();
    return { data, error: insertError };
  };

  const updateRow = async (id, payload) => {
    const { data, error: updateError } = await supabase
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (!updateError) await fetchRows();
    return { data, error: updateError };
  };

  const deleteRow = async (id) => {
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
    if (!deleteError) await fetchRows();
    return { error: deleteError };
  };

  return {
    rows,
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    filters,
    setFilters,
    refetch: fetchRows,
    createRow,
    updateRow,
    deleteRow,
  };
}
