import { ChangeEvent, Dispatch, useEffect, useReducer } from "react";

import { Bookmark } from "@edifice-ui/icons";
import {
  OptionListItemType,
  useDebounce,
  useIsAdml,
  useOdeClient,
} from "@edifice-ui/react";
import {
  odeServices,
  ShareRightAction,
  ShareRight,
  IResource,
  ShareSubject,
  ShareRightWithVisibles,
} from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { ShareAction } from "./useShare";

type State = {
  searchInputValue: string;
  searchResults: OptionListItemType[];
  searchAPIResults: ShareSubject[];
  isSearching: boolean;
};

type Action =
  | { type: "onChange"; payload: string }
  | { type: "isSearching"; payload: boolean }
  | { type: "addResult"; payload: OptionListItemType[] }
  | { type: "addApiResult"; payload: ShareSubject[] }
  | { type: "updateSearchResult"; payload: OptionListItemType[] }
  | { type: "emptyResult"; payload: OptionListItemType[] };

const initialState = {
  searchInputValue: "",
  searchResults: [],
  searchAPIResults: [],
  isSearching: false,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "onChange":
      return { ...state, searchInputValue: action.payload };
    case "isSearching":
      return { ...state, isSearching: action.payload };
    case "addResult":
      return { ...state, searchResults: action.payload };
    case "addApiResult":
      return { ...state, searchAPIResults: action.payload };
    case "updateSearchResult":
      return { ...state, searchResults: action.payload };
    case "emptyResult":
      return { ...state, searchResults: action.payload };
    default:
      throw new Error(`Unhandled action type`);
  }
}

const defaultActions: ShareRightAction[] = [
  {
    id: "read",
    displayName: "read",
  },
  {
    id: "comment",
    displayName: "comment",
  },
];

export const useSearch = ({
  resource,
  shareRights,
  shareDispatch,
}: {
  resource: IResource;
  shareRights: ShareRightWithVisibles;
  shareDispatch: Dispatch<ShareAction>;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const debouncedSearchInputValue = useDebounce<string>(
    state.searchInputValue,
    500,
  );

  const { isAdml } = useIsAdml();
  const { appCode } = useOdeClient();

  const { t } = useTranslation();

  useEffect(() => {
    search(debouncedSearchInputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInputValue]);

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    dispatch({
      type: "onChange",
      payload: value,
    });
  };

  const search = async (debouncedSearchInputValue: string) => {
    dispatch({
      type: "isSearching",
      payload: true,
    });
    // start search from 1 caracter length for non Adml but start from 3 for Adml
    if (
      (!isAdml && debouncedSearchInputValue.length >= 1) ||
      (isAdml && debouncedSearchInputValue.length >= 3)
    ) {
      const resSearchShareSubjects = await odeServices
        .share()
        .searchShareSubjects(
          appCode,
          resource.assetId,
          debouncedSearchInputValue,
        );

      dispatch({
        type: "addApiResult",
        payload: resSearchShareSubjects,
      });

      const adaptedResults = resSearchShareSubjects
        // exclude subjects that are already in the share table
        .filter(
          (right: { id: any }) =>
            !shareRights.rights.find(
              (shareRight: { id: any }) => shareRight.id === right.id,
            ),
        )
        // exclude owner from results
        .filter(
          (right: { type: string; id: any }) =>
            !(right.type === "user" && right.id === resource.creatorId),
        )
        .map(
          (searchResult: {
            id: any;
            displayName: any;
            type: string;
            profile?: string;
            structureName?: string;
          }) => {
            let label: string = searchResult.displayName;
            if (searchResult.type === "user" && searchResult.profile) {
              label = `${label} (${t(searchResult.profile)})`;
            } else if (
              searchResult.type === "group" &&
              searchResult.structureName
            ) {
              label = `${label} (${searchResult.structureName})`;
            }

            return {
              value: searchResult.id,
              label,
              icon: searchResult.type === "sharebookmark" ? <Bookmark /> : null,
            };
          },
        );

      dispatch({
        type: "addResult",
        payload: adaptedResults,
      });
    } else {
      dispatch({
        type: "emptyResult",
        payload: [],
      });
      Promise.resolve();
    }

    dispatch({
      type: "isSearching",
      payload: false,
    });
  };

  const handleSearchResultsChange = async (model: Array<string | number>) => {
    const shareSubject = state.searchAPIResults.find(
      (searchAPIResult) => searchAPIResult.id === model[0],
    );

    if (shareSubject) {
      let rightsToAdd: ShareRight[] = [];

      if (shareSubject.type === "sharebookmark") {
        const bookmarkRes = await odeServices
          .directory()
          .getBookMarkById(shareSubject.id);

        rightsToAdd.push({
          ...bookmarkRes,
          type: "sharebookmark",
          avatarUrl: "",
          directoryUrl: "",
          actions: defaultActions,
        });

        bookmarkRes?.users
          .filter(
            (user: { id: any }) =>
              !shareRights.rights.find(
                (right: { id: any }) => right.id === user.id,
              ),
          )
          .forEach((user: any) => {
            rightsToAdd.push({
              ...user,
              type: "user",
              avatarUrl: "",
              directoryUrl: "",
              actions: defaultActions,
              isBookmarkMember: true,
            });
          });
        bookmarkRes.groups
          .filter(
            (group: { id: any }) =>
              !shareRights.rights.find(
                (right: { id: any }) => right.id === group.id,
              ),
          )
          .forEach((group: any) => {
            rightsToAdd.push({
              ...group,
              type: "group",
              avatarUrl: "",
              directoryUrl: "",
              actions: defaultActions,
              isBookmarkMember: true,
            });
          });
      } else {
        rightsToAdd = [
          {
            ...shareSubject,
            actions: [
              {
                id: "read",
                displayName: "read",
              },
              {
                id: "comment",
                displayName: "comment",
              },
            ],
          },
        ];
      }

      shareDispatch({
        type: "updateShareRights",
        payload: {
          ...shareRights,
          rights: [...shareRights.rights, ...rightsToAdd],
        },
      });

      dispatch({
        type: "updateSearchResult",
        payload: state.searchResults.filter(
          (result) => result.value !== model[0],
        ),
      });
    }
  };

  const showSearchNoResults = (): boolean => {
    return (
      (!state.isSearching &&
        !isAdml &&
        debouncedSearchInputValue.length > 0 &&
        state.searchResults.length === 0) ||
      (!state.isSearching &&
        isAdml &&
        debouncedSearchInputValue.length > 3 &&
        state.searchResults.length === 0)
    );
  };

  const showSearchAdmlHint = (): boolean => {
    return isAdml && state.searchInputValue.length < 3;
  };

  const showSearchLoading = (): boolean => {
    return state.isSearching;
  };

  const getSearchMinLength = (): number => {
    return isAdml ? 3 : 1;
  };

  return {
    state,
    showSearchAdmlHint,
    showSearchLoading,
    showSearchNoResults,
    getSearchMinLength,
    handleSearchInputChange,
    handleSearchResultsChange,
  };
};
