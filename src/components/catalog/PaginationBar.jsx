import React from "react";
import { cx } from "../../lib/classNames.js";

export function PaginationBar(props) {
  var pag = props.pagination;
  if (!pag || pag.totalPages <= 1) {
    return null;
  }
  var pages = [];
  var start = Math.max(1, pag.currentPage - 2);
  var end = Math.min(pag.totalPages, start + 4);
  for (var p = start; p <= end; p++) {
    pages.push(p);
  }
  return (
    <nav className="ns-pagination" aria-label="Pagination">
      {pages.map(function (pageNum) {
        var active = pageNum === pag.currentPage;
        return (
          <a
            key={"page-" + pageNum}
            href={"?page=" + pageNum}
            className={cx("ns-page-link", { "is-active": active })}
            aria-current={active ? "page" : undefined}
          >
            {pageNum}
          </a>
        );
      })}
    </nav>
  );
}
