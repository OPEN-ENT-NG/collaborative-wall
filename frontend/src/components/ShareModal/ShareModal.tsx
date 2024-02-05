import { Bookmark, InfoCircle, RafterDown } from "@edifice-ui/icons";
import {
  useOdeClient,
  Modal,
  Heading,
  VisuallyHidden,
  Avatar,
  Checkbox,
  Button,
  Tooltip,
  Combobox,
} from "@edifice-ui/react";
import { IResource, ShareRight } from "edifice-ts-client";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import ShareBlog from "./apps/ShareBlog";
import { useSearch } from "./hooks/useSearch";
import useShare from "./hooks/useShare";
import useShareBlog from "./hooks/useShareBlog";
import { useShareBookmark } from "./hooks/useShareBookmark";
import { ShareBookmark } from "./ShareBookmark";
import { ShareBookmarkLine } from "./ShareBookmarkLine";

export interface CallbackProps {
  entId: string;
  thumbnail: string;
  resourceId: string;
  rights: ShareRight[];
}

interface ShareResourceModalProps {
  isOpen: boolean;
  resource: IResource;
  /* updateResource: UseMutationResult<
    UpdateResult,
    unknown,
    UpdateParameters,
    unknown
  >;
  shareResource: UseMutationResult<
    PutShareResponse,
    unknown,
    {
      resourceId: string;
      rights: ShareRight[];
    },
    unknown
  >; */
  onSuccess: ({ entId, thumbnail, resourceId, rights }: CallbackProps) => void;
  onCancel: () => void;
}

export default function ShareResourceModal({
  isOpen,
  resource,
  onSuccess,
  onCancel,
}: ShareResourceModalProps) {
  const { appCode } = useOdeClient();
  const {
    radioPublicationValue,
    shareBlogPayload,
    handleRadioPublicationChange,
  } = useShareBlog({ resource });

  const {
    state: { isSharing, shareRights, shareRightActions },
    dispatch: shareDispatch,
    myAvatar,
    currentIsAuthor,
    handleShare,
    toggleRight,
    handleDeleteRow,
  } = useShare({
    resource,
    onSuccess,
  });

  const {
    state: { searchResults, searchInputValue },
    showSearchAdmlHint,
    showSearchLoading,
    showSearchNoResults,
    getSearchMinLength,
    handleSearchInputChange,
    handleSearchResultsChange,
  } = useSearch({ resource, shareRights, shareDispatch });

  const {
    refBookmark,
    showBookmark,
    handleBookmarkChange,
    toggleBookmark,
    bookmark,
    handleOnSave,
    showBookmarkInput,
    toggleBookmarkInput,
  } = useShareBookmark({ shareRights, shareDispatch });

  const { t } = useTranslation();

  const searchPlaceholder = showSearchAdmlHint()
    ? t("explorer.search.adml.hint")
    : t("explorer.modal.share.search.placeholder");

  return createPortal(
    <Modal id="share_modal" size="lg" isOpen={isOpen} onModalClose={onCancel}>
      <Modal.Header onModalClose={onCancel}>{t("share.title")}</Modal.Header>
      <Modal.Body>
        <Heading headingStyle="h4" level="h3" className="mb-16">
          {t("explorer.modal.share.usersWithAccess")}
        </Heading>
        <div className="table-responsive">
          <table className="table border align-middle mb-0">
            <thead className="bg-secondary">
              <tr>
                <th scope="col" className="w-32">
                  <VisuallyHidden>
                    {t("explorer.modal.share.avatar.shared.alt")}
                  </VisuallyHidden>
                </th>
                <th scope="col">
                  <VisuallyHidden>
                    {t("explorer.modal.share.search.placeholder")}
                  </VisuallyHidden>
                </th>
                {shareRightActions.map((shareRightAction) => (
                  <th
                    key={shareRightAction.displayName}
                    scope="col"
                    className="text-center text-white"
                  >
                    {t(shareRightAction.displayName)}
                  </th>
                ))}
                <th scope="col">
                  <VisuallyHidden>{t("close")}</VisuallyHidden>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentIsAuthor() && (
                <tr>
                  <th scope="row">
                    <Avatar
                      alt={t("explorer.modal.share.avatar.me.alt")}
                      size="xs"
                      src={myAvatar}
                      variant="circle"
                    />
                  </th>
                  <td>{t("share.me")}</td>
                  {shareRightActions.map((shareRightAction) => (
                    <td
                      key={shareRightAction.displayName}
                      style={{ width: "80px" }}
                      className="text-center text-white"
                    >
                      <Checkbox checked={true} disabled />
                    </td>
                  ))}
                  <td></td>
                </tr>
              )}
              <ShareBookmarkLine
                showBookmark={showBookmark}
                shareRightActions={shareRightActions}
                shareRights={shareRights}
                onDeleteRow={handleDeleteRow}
                toggleRight={toggleRight}
                toggleBookmark={toggleBookmark}
              />
            </tbody>
          </table>
        </div>
        <div className="mt-16">
          <Button
            color="tertiary"
            leftIcon={<Bookmark />}
            rightIcon={
              <RafterDown
                title="Show"
                className="w-16 min-w-0"
                style={{
                  transition: "rotate 0.2s ease-out",
                  rotate: showBookmarkInput ? "-180deg" : "0deg",
                }}
              />
            }
            type="button"
            variant="ghost"
            className="fw-normal"
            onClick={() => toggleBookmarkInput(!showBookmarkInput)}
          >
            {t("share.save.sharebookmark")}
          </Button>
          {showBookmarkInput && (
            <ShareBookmark
              refBookmark={refBookmark}
              bookmark={bookmark}
              onBookmarkChange={handleBookmarkChange}
              onSave={handleOnSave}
            />
          )}
        </div>
        <hr />
        <Heading
          headingStyle="h4"
          level="h3"
          className="mb-16 d-flex align-items-center"
        >
          <div className="me-8">{t("explorer.modal.share.search")}</div>
          <Tooltip
            message={
              "Vos favoris de partage s’affichent en priorité dans votre liste lorsque vous recherchez un groupe ou une personne, vous pouvez les retrouver dans l’annuaire."
            }
            placement="top"
          >
            <InfoCircle className="c-pointer" height="18" />
          </Tooltip>
        </Heading>
        <div className="row">
          <div className="col-10">
            <Combobox
              value={searchInputValue}
              placeholder={searchPlaceholder}
              isLoading={showSearchLoading()}
              noResult={showSearchNoResults()}
              options={searchResults}
              searchMinLength={getSearchMinLength()}
              onSearchInputChange={handleSearchInputChange}
              onSearchResultsChange={handleSearchResultsChange}
            />
          </div>
        </div>
        {appCode === "blog" && (
          <ShareBlog
            radioPublicationValue={radioPublicationValue}
            onRadioPublicationChange={handleRadioPublicationChange}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          color="tertiary"
          variant="ghost"
          onClick={onCancel}
        >
          {t("explorer.cancel")}
        </Button>

        <Button
          type="button"
          color="primary"
          variant="filled"
          isLoading={isSharing}
          onClick={() => handleShare(shareBlogPayload)}
          disabled={isSharing}
        >
          {t("share")}
        </Button>
      </Modal.Footer>
    </Modal>,
    document.getElementById("portal") as HTMLElement,
  );
}
