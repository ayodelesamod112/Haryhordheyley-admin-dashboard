// function Loader({ label = "Loading…" }) {
//   return (
//     <div className="loader-wrap" role="status" aria-live="polite">
//       <span className="loader-spinner" />
//       <span className="loader-label">{label}</span>
//     </div>
//   );
// }

// export default Loader;

import avatar from "../../assets/Avatar.png";

function Loader({ label = "Loading…" }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="loader-ring">
        <img src={avatar} alt="" className="loader-avatar-img" />
      </div>
      <span className="loader-label">{label}</span>
    </div>
  );
}

export default Loader;