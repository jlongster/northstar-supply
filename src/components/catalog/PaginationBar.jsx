import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { NavContext } from "../../context/NavContext.js";
import { cx } from "../../lib/classNames.js";
import { formatInt } from "../../lib/numbers.js";

export function PaginationBar(props) {
  var nav = React.useContext(NavContext);
  var locale = React.useContext(LocaleContext);
  var pag = props.pagination;
  if (!pag || pag.totalPages <= 1) {
    return null;
  }
  var prefix = nav.base + pag.hrefPrefix;
  if (pag.showingAll) {
    return (
      <nav className="ns-pagination" aria-label="Pagination">
        <a className="ns-page-link ns-page-wide" href={prefix + "1"}>
          Show {pag.pageSize} per page
        </a>
      </nav>
    );
  }
  var pages = [];
  var start = Math.max(1, Math.min(pag.currentPage - 2, pag.totalPages - 4));
  var end = Math.min(pag.totalPages, start + 4);
  for (var p = start; p <= end; p++) {
    pages.push(p);
  }
  var hasPrev = pag.currentPage > 1;
  var hasNext = pag.currentPage < pag.totalPages;
  return (
    <nav className="ns-pagination" aria-label="Pagination">
      {hasPrev ? (
        <a className="ns-page-link ns-page-wide" href={prefix + (pag.currentPage - 1)} rel="prev">
          Previous
        </a>
      ) : (
        <span className="ns-page-link ns-page-wide is-disabled">Previous</span>
      )}
      {pages.map(function (pageNum) {
        var active = pageNum === pag.currentPage;
        return (
          <a
            key={"page-" + pageNum}
            href={prefix + pageNum}
            className={cx("ns-page-link", { "is-active": active })}
            aria-current={active ? "page" : undefined}
          >
            {pageNum}
          </a>
        );
      })}
      {hasNext ? (
        <a className="ns-page-link ns-page-wide" href={prefix + (pag.currentPage + 1)} rel="next">
          Next
        </a>
      ) : (
        <span className="ns-page-link ns-page-wide is-disabled">Next</span>
      )}
      <a className="ns-page-all" href={prefix + "all"}>
        View all {formatInt(pag.totalMatching, locale.groupSep)}
      </a>
    </nav>
  );
}
