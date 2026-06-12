// // "use client";

// // interface LangSwitcherProps {
// //   locale: string;
// // }

// // export function LangSwitcher({ locale }: LangSwitcherProps) {
// //   async function switchLocale(newLocale: string) {
// //     await fetch("/api/set-locale", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ locale: newLocale }),
// //     });
// //     window.location.reload();
// //   }

// //   return (
// //     <div className="flex items-center gap-1 text-[13px] font-bold tracking-widest">
// //       <button
// //         onClick={() => switchLocale("ru")}
// //         className={locale === "ru" ? "text-white" : "text-white/50 hover:text-white/80 transition-colors"}
// //       >
// //         RU
// //       </button>
// //       <span className="text-white/30">|</span>
// //       <button
// //         onClick={() => switchLocale("en")}
// //         className={locale === "en" ? "text-white" : "text-white/50 hover:text-white/80 transition-colors"}
// //       >
// //         EN
// //       </button>
// //     </div>
// //   );
// // }


// "use client";

// interface LangSwitcherProps {
//   locale: string;
// }

// export function LangSwitcher({ locale }: LangSwitcherProps) {
//   async function switchLocale(newLocale: string) {
//     await fetch("/api/set-locale", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ locale: newLocale }),
//     });
//     window.location.reload();
//   }

//   return (
//     <div className="flex items-center gap-1 text-[13px] font-bold tracking-widest р">
//       <button
//         onClick={() => switchLocale("ru")}
//         className={locale === "ru" ? "text-white" : "text-white/50 hover:text-white/80 transition-colors"}
//       >
//         RU
//       </button>
//       <span className="text-white/30">|</span>
//       <button
//         onClick={() => switchLocale("en")}
//         className={locale === "en" ? "text-white" : "text-white/50 hover:text-white/80 transition-colors"}
//       >
//         EN
//       </button>
//     </div>
//   );
// }

"use client";

interface LangSwitcherProps {
  locale: string;
}

export function LangSwitcher({ locale }: LangSwitcherProps) {
  async function switchLocale(newLocale: string) {
    await fetch("/api/set-locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });
    window.location.reload();
  }

  const btnClass = "px-2.5 py-1 rounded-md text-[13px] font-bold tracking-widest transition-all duration-200 ease-in-out";

  return (
    // Добавили небольшой паддинг и фон для самого контейнера, чтобы плашки смотрелись гармонично
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10 width-fit">
      <button
        onClick={() => switchLocale("ru")}
        className={`${btnClass} ${
          locale === "ru"
            ? "bg-white text-black shadow-sm"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        RU
      </button>
      
      <button
        onClick={() => switchLocale("en")}
        className={`${btnClass} ${
          locale === "en"
            ? "bg-white text-black shadow-sm"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
