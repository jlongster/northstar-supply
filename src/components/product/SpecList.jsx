import React from "react";

export function SpecList(props) {
  var specs = props.specs;
  if (!specs || specs.length === 0) {
    return null;
  }
  return (
    <dl className="ns-specs">
      {specs.map(function (spec, idx) {
        return (
          <React.Fragment key={spec.label + ":" + idx}>
            <dt className="ns-spec-label">{spec.label}</dt>
            <dd className="ns-spec-val">{spec.value}</dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}
