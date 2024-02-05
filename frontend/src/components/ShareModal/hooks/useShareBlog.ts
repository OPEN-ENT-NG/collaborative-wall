import { useEffect, useState } from "react";

import { IResource, type BlogUpdate, BlogResource } from "edifice-ts-client";

export type PublicationType = "RESTRAINT" | "IMMEDIATE" | undefined;

export default function useShareBlog({ resource }: { resource: IResource }) {
  const {
    assetId,
    description,
    thumbnail,
    name,
    public: pub,
    trashed,
    slug,
    "publish-type": publishType,
  } = resource
    ? (resource as BlogResource)
    : {
        "publish-type": "",
        assetId: "",
        description: "",
        name: "",
        public: false,
        slug: "",
        thumbnail: "",
        trashed: false,
      };

  const [radioPublicationValue, setRadioPublicationValue] =
    useState<PublicationType>((publishType as PublicationType) || "RESTRAINT");

  const [shareBlogPayload, setShareBlogPayload] = useState({
    description: description || "",
    entId: assetId,
    name,
    public: !!pub,
    slug: slug || "",
    thumbnail,
    trashed,
    "publish-type": publishType,
  } as unknown as BlogUpdate);

  useEffect(() => {
    if (radioPublicationValue) {
      setShareBlogPayload((prev) => ({
        ...prev,
        "publish-type": radioPublicationValue,
      }));
    }
  }, [radioPublicationValue]);

  const handleRadioPublicationChange = async (value: PublicationType) => {
    setRadioPublicationValue(value);
  };

  return {
    radioPublicationValue,
    shareBlogPayload,
    handleRadioPublicationChange,
  };
}
