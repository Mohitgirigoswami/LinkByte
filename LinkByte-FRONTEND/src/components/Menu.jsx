import { useEffect, useRef } from "react";

const Menu = ({ isMob, isOpen, onClose }) => {
  const menuref = useRef(null);

  const handleClickOutside = (e) => {
    if (menuref.current && !menuref.current.contains(e.target)) {
      onClose();
    }
  };
  useEffect(() => {
    if (isMob && isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [onClose]);
  let menuClasses =
    "bg-black h-[100vh] absolute transition-all duration-300 ease-in-out ";

  if (isMob) {
    if (!isOpen) {
      menuClasses += "w-0 ";
    } else {
      menuClasses += "w-[70vw] ";
    }
  } else {
    menuClasses += "w-[40vw] relative ";
  }
  return <div ref={menuref} className={menuClasses}>
    <div id="menuprofilearea" className={(!isMob?"hidden":(isOpen && "mx-2.5 ")+"h-[25%] border-b-1 border-b-gray-100")}></div>
  </div>;
};
export default Menu;
