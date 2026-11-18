
import { useEffect } from "react";

const usePageMeta = (title, description) => {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);

  }, [title, description]);
};

export default usePageMeta;
