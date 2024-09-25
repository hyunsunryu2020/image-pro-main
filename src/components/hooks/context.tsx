import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interfaces";
import SegContext from "./createContext";

const SegContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);

  return (
    <SegContext.Provider
      value={{
        clicks: [clicks, setClicks],
        image: [image, setImage],
        maskImg: [maskImg, setMaskImg],
      }}
    >
      {props.children}
    </SegContext.Provider>
  );
};

export default SegContextProvider;
