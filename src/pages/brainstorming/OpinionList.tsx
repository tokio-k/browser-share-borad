import { gql } from "@apollo/client";
import type { VFC } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { OpinionsFragment } from "src/apollo/graphql";
import { useBranistorming_UpdateOpinionPositionMutation } from "src/apollo/graphql";
import { useBranistorming_EnableOpinionMutation } from "src/apollo/graphql";
import { useBranistorming_DisableOpinionMutation } from "src/apollo/graphql";
import { useBranistorming_UpdateOpinionMutation } from "src/apollo/graphql";
import { ErrorMessage } from "src/components/Error";
import type { OpinionForm } from "src/pages/brainstorming/OpinionForm";
import { useInteractJS } from "src/utils/hooks/useInteractJS";

type MenuButtonProps = {
  id: string;
  isDisable: boolean;
  isEdit: boolean;
  setIsEdit: (v: boolean) => void;
  setIsDisable: (v: boolean) => void;
  handleCancelEdit: () => void;
};

type Props = {
  opinionList: OpinionsFragment[];
};

const MenuButton: VFC<MenuButtonProps> = (props) => {
  const [disableOpinion] = useBranistorming_DisableOpinionMutation();
  const [enableOpinion] = useBranistorming_EnableOpinionMutation();
  const [isError, setIsError] = useState<boolean>(false);
  const handleEdit = () => {
    props.setIsEdit(true);
  };
  const handleDisable = () => {
    if (props.isEdit) {
      props.handleCancelEdit();
      return;
    }
    props.setIsDisable(true);
    disableOpinion({ variables: { id: props.id } }).catch(() => {
      setIsError(true);
      props.setIsDisable(false);
      setTimeout(() => {
        return setIsError(false);
      }, 2000);
    });
  };
  const handleEnable = () => {
    props.setIsDisable(false);
    enableOpinion({ variables: { id: props.id } }).catch(() => {
      setIsError(true);
      props.setIsDisable(true);
      setTimeout(() => {
        return setIsError(false);
      }, 2000);
    });
  };
  if (isError) {
    return <ErrorMessage message="エラーが発生しました。" />;
  }
  if (props.isDisable)
    return (
      <button onClick={handleEnable} className="text-blue-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1 mt-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>
    );
  return (
    <>
      {props.isEdit ? (
        <span className="text-xs text-blue-600">編集中</span>
      ) : (
        <button
          onClick={handleEdit}
          className="text-gray-300 group-hover:text-gray-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}
      <button
        onClick={handleDisable}
        className="text-gray-300 group-hover:text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </>
  );
};

const OpinionItem: VFC<OpinionsFragment> = (props) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [opinion, setOpinion] = useState<string>(props.opinion);
  const [isDisable, setIsDisable] = useState<boolean>(props.disable_flag == 1);
  const [isError, setIsError] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OpinionForm>();
  const [updateOpinion] = useBranistorming_UpdateOpinionMutation();
  const [updatePosition] = useBranistorming_UpdateOpinionPositionMutation();
  const handleChangePosition = (x: number, y: number) => {
    updatePosition({
      variables: { id: props.id, position_x: x, position_y: y },
    });
  };
  const interact = useInteractJS({
    position: {
      x: props.position_x,
      y: props.position_y,
    },
    fn: handleChangePosition,
  });
  const handleEdited = handleSubmit((data) => {
    if (opinion !== data.opinion) {
      const prevOpinion = opinion;
      setOpinion(data.opinion);
      updateOpinion({
        variables: { id: props.id, opinion: data.opinion },
      }).catch(() => {
        setIsError(true);
        setOpinion(prevOpinion);
        setTimeout(() => {
          return setIsError(false);
        }, 2000);
      });
    }
    setIsEdit(false);
  });
  const onHandleCancelEdit = () => {
    setValue("opinion", opinion);
    setIsEdit(false);
  };
  useEffect(() => {
    setOpinion(props.opinion);
  }, [props.opinion]);
  useEffect(() => {
    setIsDisable(props.disable_flag == 1);
  }, [props.disable_flag]);
  return (
    <div
      className={`border inline-block w-52 p-2 pt-4 shadow-sm rounded-sm text-left relative ml-2 mt-2 group  ${
        isDisable ? "bg-gray-100" : "bg-white "
      }`}
      ref={interact.ref}
      style={{ ...interact.style }}
    >
      <div className="absolute top-0 right-0 flex items-center">
        {isError ? (
          <ErrorMessage message="エラーが発生しました。" />
        ) : (
          <MenuButton
            id={props.id}
            isDisable={isDisable}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            setIsDisable={setIsDisable}
            handleCancelEdit={onHandleCancelEdit}
          />
        )}
      </div>

      {isEdit ? (
        <div className="text-right">
          <textarea
            {...register("opinion", {
              required: "入力してください。",
              maxLength: {
                value: 100,
                message: "100文字以下で入力してください",
              },
            })}
            defaultValue={opinion}
            className="focus:outline-none w-full "
          />
          <button
            className="text-xs bg-blue-600 rounded-xl text-white py-1 px-2"
            onClick={handleEdited}
          >
            編集終了
          </button>
          {errors.opinion?.message && (
            <ErrorMessage message={errors.opinion.message} className="mt-1" />
          )}
        </div>
      ) : (
        <p className={isDisable ? "text-gray-400" : ""}>{opinion}</p>
      )}
    </div>
  );
};

export const OpinionList: VFC<Props> = (props) => {
  return (
    <div>
      {props.opinionList.map((item) => {
        return <OpinionItem {...item} key={item.id} />;
      })}
    </div>
  );
};

gql`
  fragment Opinions on branistorming_opinions {
    id
    opinion
    disable_flag
    position_x
    position_y
  }
`;

gql`
  mutation Branistorming_UpdateOpinion($id: uuid!, $opinion: String!) {
    update_branistorming_opinions_by_pk(
      pk_columns: { id: $id }
      _set: { opinion: $opinion }
    ) {
      ...Opinions
    }
  }
  mutation Branistorming_DisableOpinion($id: uuid!) {
    update_branistorming_opinions_by_pk(
      pk_columns: { id: $id }
      _set: { disable_flag: 1 }
    ) {
      ...Opinions
    }
  }
  mutation Branistorming_EnableOpinion($id: uuid!) {
    update_branistorming_opinions_by_pk(
      pk_columns: { id: $id }
      _set: { disable_flag: 0 }
    ) {
      ...Opinions
    }
  }
  mutation Branistorming_UpdateOpinionPosition(
    $id: uuid!
    $position_x: Float!
    $position_y: Float!
  ) {
    update_branistorming_opinions_by_pk(
      pk_columns: { id: $id }
      _set: { position_x: $position_x, position_y: $position_y }
    ) {
      position_x
      position_y
    }
  }
`;

// TODO:複数回処理に対応、通信中クリック、同時クリック...
