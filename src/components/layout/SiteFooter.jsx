import React from "react";
import { LocaleContext } from "../../context/LocaleContext.js";
import { NavContext } from "../../context/NavContext.js";

export function SiteFooter(props) {
  var nav = React.useContext(NavContext);
  var locale = React.useContext(LocaleContext);
  return (
    <footer className="ns-footer">
      <div className="ns-footer-grid ns-container">
        <div className="ns-footer-about">
          <a href={nav.base + "/"} className="ns-brand ns-brand-small">
            <span className="ns-brand-mark" aria-hidden="true" />
            <span className="ns-brand-name">Northstar Supply</span>
          </a>
          <p>
            Professional tools and shop supplies for maintenance teams, machine shops and
            electricians.
          </p>
        </div>
        <nav className="ns-footer-col" aria-label="Shop">
          <h2 className="ns-footer-title">Shop</h2>
          <ul>
            {props.categories.map(function (cat) {
              return (
                <li key={cat.id}>
                  <a href={nav.base + "/c/" + cat.slug}>{cat.label}</a>
                </li>
              );
            })}
          </ul>
        </nav>
        <nav className="ns-footer-col" aria-label="Account">
          <h2 className="ns-footer-title">Account</h2>
          <ul>
            <li>
              <a href={nav.base + "/signin"}>Sign in</a>
            </li>
            <li>
              <a href={nav.base + "/cart"}>Cart</a>
            </li>
            <li>
              <a href={nav.base + "/shop"}>All products</a>
            </li>
          </ul>
        </nav>
        <nav className="ns-footer-col" aria-label="About this demo">
          <h2 className="ns-footer-title">About this demo</h2>
          <ul>
            <li>
              <a href={nav.assets + "/compare"}>Compare renderers</a>
            </li>
            <li>
              <a href={nav.assets + "/"}>How it works</a>
            </li>
            <li>
              <a href="https://github.com/jlongster/northstar-supply">Source on GitHub</a>
            </li>
          </ul>
        </nav>
      </div>
      <p className="ns-footer-meta ns-container">
        <span>© Northstar Supply Co. Demo store: no orders are placed.</span>
        <span>
          Prices in {locale.currency} ({locale.code})
        </span>
      </p>
    </footer>
  );
}
