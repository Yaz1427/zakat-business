"use client";

import dynamic from "next/dynamic";

const AppProgressBar = dynamic(
  () => import("next-nprogress-bar").then((m) => ({ default: m.AppProgressBar })),
  { ssr: false }
);

export default function ProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="#2d7a4f"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
