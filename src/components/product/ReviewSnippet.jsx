import React from "react";
import { formatDateUTC } from "../../lib/dates.js";

export function ReviewSnippet(props) {
  var review = props.review;
  if (!review) {
    return null;
  }
  return (
    <figure
      className="ns-review"
      data-verified={Boolean(review.verified)}
    >
      <blockquote className="ns-review-body">
        <p>“{review.body}”</p>
      </blockquote>
      <figcaption className="ns-review-meta">
        <span className="ns-review-author">{review.author}</span>
        {review.verified ? (
          <span className="ns-review-badge">Verified buyer</span>
        ) : null}
        <time className="ns-review-date">
          {formatDateUTC(review.createdAtSec, false)}
        </time>
      </figcaption>
    </figure>
  );
}
