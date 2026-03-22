import { ReactNode } from "react";
interface Props {
  children: ReactNode;
  commentSection: ReactNode;
}
export default function EventDetailLayout({ children, commentSection }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        {/* Mobile: vertically */}
        <div className="lg:hidden space-y-6">
          <div>{children}</div>
          <div>{commentSection}</div>
        </div>
        {/* Desktop: two columns*/}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main detail content */}
          <div className="lg:col-span-8 space-y-6">{children}</div>
          {/* Comment section */}
          <div className="lg:col-span-4">
            <div
              className="sticky flex flex-col"
              style={{
                top: "4.5rem",                        // height of TopBaru (72px)
                maxHeight: "calc(100vh - 5.5rem)",    // 100vh - TopBar - small padding
              }}
            >
              {commentSection}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
