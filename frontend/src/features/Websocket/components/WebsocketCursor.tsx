import * as React from "react";

import { useOdeTheme } from "@edifice-ui/react";

import { usePerfectCursor } from "../hooks/usePerfectCursor";

export function Cursor({
  point,
  username,
}: {
  point: number[];
  username: string | undefined;
}) {
  const { theme } = useOdeTheme();
  const rCursor = React.useRef<HTMLDivElement>(null);

  const animateCursor = React.useCallback((point: number[]) => {
    const elm = rCursor.current;
    if (!elm) return;
    elm.style.setProperty(
      "transform",
      `translate(${point[0]}px, ${point[1]}px)`,
    );
  }, []);

  const onPointMove = usePerfectCursor(animateCursor);

  React.useLayoutEffect(() => onPointMove(point), [onPointMove, point]);

  return (
    <div
      ref={rCursor}
      style={{
        position: "absolute",
        zIndex: 99,
        top: -60,
        left: -15,
        width: 44,
        height: 44,
      }}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d_2941_176922)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.801 7.2849C11.5104 7.56894 11.4206 8.0006 11.5738 8.37699L19.3438 27.4688C19.498 27.8476 19.8673 28.0944 20.2763 28.0918C20.6854 28.0892 21.0516 27.8378 21.2009 27.4571L24.2266 19.7452L31.5766 17.0672C31.9612 16.9271 32.2215 16.5667 32.2338 16.1576C32.2461 15.7484 32.0078 15.3731 31.6322 15.2102L12.898 7.08264C12.5252 6.92091 12.0916 7.00085 11.801 7.2849Z"
            fill={theme?.is1d ? "#ff8d2e" : "#2A9CC8"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.801 7.2849C11.5104 7.56894 11.4206 8.0006 11.5738 8.37699L19.3438 27.4688C19.498 27.8476 19.8673 28.0944 20.2763 28.0918C20.6854 28.0892 21.0516 27.8378 21.2009 27.4571L24.2266 19.7452L31.5766 17.0672C31.9612 16.9271 32.2215 16.5667 32.2338 16.1576C32.2461 15.7484 32.0078 15.3731 31.6322 15.2102L12.898 7.08264C12.5252 6.92091 12.0916 7.00085 11.801 7.2849Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2941_176922"
            x="0.5"
            y="0"
            width="42.7343"
            height="43.0938"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2941_176922"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2941_176922"
              result="shape"
            />
          </filter>
        </defs>
      </svg>

      <div className="cursor bg-secondary-500 border border-2 border-white text-white py-2 px-4 rounded">
        <strong className="caption">{username}</strong>
      </div>
    </div>
  );
}
