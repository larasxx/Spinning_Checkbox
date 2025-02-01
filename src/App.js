import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // phase can be:
  // "normal"       – initial active mode
  // "disabled1"    – frozen for 5 seconds after 3 toggle cycles in normal mode
  // "oneToggle"    – active for ONE full toggle cycle (check then uncheck)
  // "disabled2"    – frozen for 10 seconds after the oneToggle cycle
  // "ghostTrigger" – active waiting for a click to transform into a ghost
  // "ghost"        – shows ghost emoticon with fade-out animation (1s)
  // "hidden"       – ghost has faded; the element is hidden for 5s
  // "greyed"       – reappears greyed out and unclickable
  const [phase, setPhase] = useState("normal");
  const [isChecked, setIsChecked] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  // Handle changes (clicks) on the checkbox.
  const handleChange = (e) => {
    const newValue = e.target.checked;

    if (phase === "normal") {
      // In normal mode, every full toggle (from checked → unchecked) counts.
      if (isChecked && !newValue) {
        setPressCount((prev) => {
          const newCount = prev + 1;
          // After 3 full cycles, move into a disabled phase.
          if (newCount >= 3) {
            setPhase("disabled1");
          }
          return newCount;
        });
      }
      setIsChecked(newValue);
    } else if (phase === "oneToggle") {
      // In oneToggle mode allow exactly one full cycle.
      if (isChecked && !newValue) {
        setIsChecked(newValue);
        setPhase("disabled2");
      } else {
        setIsChecked(newValue);
      }
    } else if (phase === "ghostTrigger") {
      // In ghostTrigger mode, any click turns the checkbox into a ghost.
      setPhase("ghost");
    }
    // In disabled or later phases, do nothing.
  };

  // Timer effects that automatically change phases.
  useEffect(() => {
    let timer;
    if (phase === "disabled1") {
      // After 3 cycles, the checkbox is disabled for 5 seconds.
      setIsChecked(false); // ensure it is unchecked
      timer = setTimeout(() => {
        setPhase("oneToggle");
      }, 5000);
    } else if (phase === "disabled2") {
      // After the one-toggle cycle, disable for 10 seconds.
      setIsChecked(false);
      timer = setTimeout(() => {
        setPhase("ghostTrigger");
      }, 10000);
    } else if (phase === "ghost") {
      // When in ghost mode, after 1 second (and while a CSS fade is playing) transition.
      timer = setTimeout(() => {
        setPhase("hidden");
      }, 1000);
    } else if (phase === "hidden") {
      // Keep the ghost hidden for 5 seconds.
      timer = setTimeout(() => {
        setPhase("greyed");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  // Determine if the checkbox should be disabled.
  const inputDisabled =
    phase === "disabled1" || phase === "disabled2" || phase === "greyed";

  // Build the className for the checkbox:
  // - Always add "big" (3× size).
  // - When checked in active phases, add "spin" for the spinning animation.
  // - When in greyed phase, add "greyed" styling.
  let checkboxClass = "big";
  if (
    (phase === "normal" ||
      phase === "oneToggle" ||
      phase === "ghostTrigger" ||
      phase === "disabled1" ||
      phase === "disabled2") &&
    isChecked
  ) {
    checkboxClass += " spin";
  }
  if (phase === "greyed") {
    checkboxClass += " greyed";
  }

  return (
    <div className="App">
      {phase === "ghost" ? (
        // Render ghost emoticon. Its CSS animation (see App.css) fades it out.
        <div className="ghost">👻</div>
      ) : phase === "hidden" ? (
        // While hidden, render an empty placeholder (or nothing).
        <div style={{ height: "60px" }}></div>
      ) : (
        // In all other phases, render the checkbox input.
        <input
          type="checkbox"
          className={checkboxClass}
          checked={isChecked}
          onChange={handleChange}
          disabled={inputDisabled}
        />
      )}
    </div>
  );
}

export default App;
