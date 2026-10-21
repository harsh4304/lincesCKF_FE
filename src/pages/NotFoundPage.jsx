// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  let homePath = "/";

  if (user) {
    homePath = user.role === "brand" ? "/brand" : "/catalog";
  }

  return (
    <div className="mx-auto flex min-h-[100vh-4rem] max-w-4xl items-center justify-center px-4 py-12 text-[#181818]">
      <div className="text-center">
        <h1 className="font-serif text-3xl text-[#13293D]">
          {t("notFound.title")}
        </h1>

        <p className="mt-4 text-sm text-[#5A5A5A]">
          {t("notFound.description")}
        </p>

        <Link
          to={homePath}
          className="mt-6 inline-block rounded-full border border-[#13293D] px-6 py-2 text-xs uppercase tracking-wide text-[#13293D] hover:bg-[#13293D] hover:text-white transition-all"
        >
          {t("notFound.goHome")}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;