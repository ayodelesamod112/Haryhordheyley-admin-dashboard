

import { LuWrench, LuZap, LuShieldCheck, LuHeadset } from "react-icons/lu";

const FEATURES = [
  {
    icon: LuWrench,
    title: "Repairs & Installations",
    text: "Expert hands-on service for every device that walks through the door.",
  },
  {
    icon: LuZap,
    title: "Same-Day Turnaround",
    text: "Most requests are picked up, worked on, and resolved the same day.",
  },
  {
    icon: LuShieldCheck,
    title: "Transparent & Secure",
    text: "Every order and payment tracked, with nothing hidden along the way.",
  },
  {
    icon: LuHeadset,
    title: "A Team You Can Reach",
    text: "Real support from real people, whenever your customers need it.",
  },
];

function AuthSidePanel() {
  return (
    <div className="auth-side-panel">
      <span className="eyebrow">Smart Tech. Real Service.</span>
      <h1>Run your service business with confidence.</h1>
      <p className="intro">
        HARYHORDHEYLEY Smart Tech Digital Service keeps every customer, order, and payment
        organized in one place — so nothing slips through the cracks and every job gets the
        attention it deserves.
      </p>
      <div className="auth-feature-list">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div className="auth-feature" key={title}>
            <div className="auth-feature-icon">
              <Icon size={18} />
            </div>
            <div className="auth-feature-text">
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuthSidePanel;