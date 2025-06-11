import { useEffect, useRef } from "react";

const Menu = ({isMob , isOn , onClose}) => {
  const menuref = useRef(null);

  const handleClickOutside = (e) => {
    if (menuref.current && !menuref.current.contains(e.target)) {
      onClose();
    }
  };
  useEffect(() => {
    if (isMob && isOn) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [onClose]);
  let menuClasses = "bg-amber-50 h-[100vh] absolute transition-all duration-300 ease-in-out ";

if (isMob) {
  if (!isOn) {
    menuClasses += "w-0 ";
  }else{
    menuClasses += "w-[66vw] ";
  }
} else {
  menuClasses += "w-[40vw] relative ";
}
  return (
    <div
      ref={menuref}
      className={menuClasses}
    ></div>
  );
};
export default Menu;
