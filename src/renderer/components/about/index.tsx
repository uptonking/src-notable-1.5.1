import React from "react";
import * as path from "path";
import pkg from "@root/package.json";

const About = () => (
  <div className="about app-wrapper layout multiple vertical center">
    <img
      src={`file://${path.join(__static, "images", "icon.png")}`}
      width={64}
    />
    <p className="title">{pkg.productName}</p>
    <p className="description">Version {pkg.version}</p>
    <p className="description">
      {pkg.license} © {pkg.author.name}
    </p>
    <p className="description"> test-20200525 日</p>
  </div>
);

export default About;
