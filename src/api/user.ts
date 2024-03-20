import { UserAction, UserActionKind } from "../store/UserContext";
import { toast } from "react-toastify";
import PhoneNumber, { CountryCode } from "libphonenumber-js";
import { AddressItemTypes, User } from "../utils/user-types";
import { ActionTypeProps } from "../utils/types";
import { axiosPrivate } from "./axios";

export const getCountryCode = async (
  setCountryCode: (code: CountryCode | undefined) => void
) => {
  try {
    // Fetch the user's IP-based location
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    setCountryCode(data.country);
  } catch (error) {
    console.error("Error fetching country:", error);
  }
};

export const getMe = async (
  dispatch: React.Dispatch<UserAction>
): Promise<void> => {
  try {
    dispatch({ type: UserActionKind.GETME_START });
    const { data } = await axiosPrivate.get("/users/me");
    dispatch({ type: UserActionKind.GETME_SUCCESS, payload: data.user });
  } catch (err: any) {
    const error = err.response?.data.message || "Something went wrong.";
    dispatch({ type: UserActionKind.GETME_FAILURE, error });
    toast.error(error);
  }
};

export const updateMe = async (
  dispatch: React.Dispatch<UserAction>,
  userData: {
    phoneNumber: string | undefined;
    name: string | undefined;
    username: string | undefined;
    email: string | undefined;
    photoRef: React.RefObject<HTMLInputElement>;
    countryCode: CountryCode | undefined;
  }
) => {
  const validatePhoneNumber = (number: string, code: CountryCode) => {
    return PhoneNumber(number, code)!.isValid() ? true : false;
  };

  const { phoneNumber, name, username, email, photoRef, countryCode } =
    userData;

  // Check if phonenumber is in correct format.
  if (phoneNumber && !validatePhoneNumber(phoneNumber, countryCode!)) {
    toast.warning("Please enter a valid phone number.");
    return;
  }

  const formData = new FormData();
  formData.append("phoneNumber", phoneNumber ? (phoneNumber as string) : "");
  formData.append("name", name as string);
  formData.append("username", username as string);
  formData.append("email", email as string);
  const userPhoto = photoRef.current?.files![0]
    ? (photoRef.current.files[0] as Blob)
    : "";
  formData.append("photo", userPhoto);

  try {
    dispatch({ type: UserActionKind.UPDATE_ME_START });

    const { data } = await axiosPrivate.patch("/users/updateMe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch({ type: UserActionKind.UPDATE_ME_SUCCESS, payload: data.user });
    toast.success("Your data's been successfully updated.");
  } catch (err: any) {
    dispatch({
      type: UserActionKind.UPDATE_ME_FAILURE,
      error: err.response?.data.message,
    });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};

export const addDeleteUpdateAddress = async (
  dispatch: React.Dispatch<UserAction>,
  actionType: ActionTypeProps,
  user: User,
  addressRefs: {
    nameRef: React.RefObject<HTMLInputElement>;
    cityRef: React.RefObject<HTMLInputElement>;
    address1Ref: React.RefObject<HTMLInputElement>;
    address2Ref: React.RefObject<HTMLInputElement>;
    postalCodeRef: React.RefObject<HTMLInputElement>;
    phoneNumber: string;
    countryCode: CountryCode;
  },
  addressItem: AddressItemTypes,
  closeModal: () => void
) => {
  const validatePhoneNumber = (number: string, code: CountryCode) => {
    return PhoneNumber(number, code)!.isValid() ? true : false;
  };

  if (!user) return;

  // 1. Get all values from input
  const name = addressRefs.nameRef.current?.value!;
  const city = addressRefs.cityRef.current?.value!;
  const address1 = addressRefs.address1Ref.current?.value!;
  const address2 = addressRefs.address2Ref.current?.value!;
  const postalCode = Number(addressRefs.postalCodeRef.current?.value!);

  let newAddresses: AddressItemTypes[] = [];

  // Check if phonenumber is in correct format.
  if (
    addressRefs.phoneNumber &&
    !validatePhoneNumber(addressRefs.phoneNumber, addressRefs.countryCode!)
  ) {
    toast.error("Please enter a valid phone number.");
    return;
  }

  const newAddress: AddressItemTypes = {
    name,
    phoneNumber: addressRefs.phoneNumber,
    city,
    address1,
    address2,
    postalCode,
  };

  switch (actionType) {
    case "delete":
      newAddresses = user.addresses.filter(
        (item) => item._id !== addressItem?._id
      );
      break;

    case "add":
      user.addresses.length > 0
        ? (newAddresses = [...user?.addresses!, newAddress])
        : (newAddresses = [newAddress]);
      break;

    case "update":
      if (user.addresses.length === 1) newAddresses = [newAddress];
      else if (user.addresses.length > 1) {
        // Find the index of the updating address and replaces it with new updated address
        const updatingAddressIndex = user.addresses.findIndex(
          (item) => item._id === addressItem?._id
        );
        const userAddressesCopy = [...user.addresses];
        userAddressesCopy[updatingAddressIndex] = newAddress;
        newAddresses = userAddressesCopy;
      }
      break;
    default:
      break;
  }

  try {
    dispatch({ type: UserActionKind.UPDATE_ME_START });
    const { data } = await axiosPrivate.patch("users/updateMe", {
      addresses: newAddresses,
    });

    dispatch({ type: UserActionKind.UPDATE_ME_SUCCESS, payload: data.user });
    toast.success("Your data's been successfully updated.");
    closeModal();
  } catch (err: any) {
    dispatch({
      type: UserActionKind.UPDATE_ME_FAILURE,
      error: err.response?.data.message,
    });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};

export const getCompareOrWishlist = async (
  dispatch: React.Dispatch<UserAction>,
  type: "compare" | "wishlisted"
): Promise<void> => {
  try {
    const { data } = await axiosPrivate.get(`/users/me/${type}`);

    dispatch({
      type: UserActionKind.GET_COMPARE_OR_WISHLIST_SUCCESS,
      payload: {
        data: data.data,
        type,
      },
    });
  } catch (err: any) {
    console.log("err:", err);
    dispatch({
      type: UserActionKind.GET_COMPARE_OR_WISHLIST_FAILURE,
      error: err.response?.data.message || "Something went wrong.",
    });
  }
};

export const addToWishlist = async (
  dispatch: React.Dispatch<UserAction>,
  id: string
): Promise<void> => {
  try {
    dispatch({ type: UserActionKind.ADD_TO_WISHLIST, payload: id });
    await axiosPrivate.patch("/users/me/wishlisted/add", {
      productId: id,
    });
  } catch (err: any) {
    dispatch({ type: UserActionKind.ADD_TO_WISHLIST_FAIL });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};

export const removeFromWishlist = async (
  dispatch: React.Dispatch<UserAction>,
  id: string
): Promise<void> => {
  try {
    dispatch({ type: UserActionKind.REMOVE_FROM_WISHLIST, payload: id });
    await axiosPrivate.patch("/users/me/wishlisted/remove", {
      productId: id,
    });
  } catch (err: any) {
    dispatch({ type: UserActionKind.REMOVE_FROM_WISHLIST_FAIL, payload: id });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};

export const addToCompare = async (
  dispatch: React.Dispatch<UserAction>,
  id: string
): Promise<void> => {
  try {
    dispatch({ type: UserActionKind.ADD_TO_COMPARE, payload: id });
    await axiosPrivate.patch("/users/me/compare/add", {
      productId: id,
    });
  } catch (err: any) {
    dispatch({ type: UserActionKind.ADD_TO_COMPARE_FAIL });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};

export const removeFromCompare = async (
  dispatch: React.Dispatch<UserAction>,
  id: string
): Promise<void> => {
  try {
    dispatch({ type: UserActionKind.REMOVE_FROM_COMPARE, payload: id });
    await axiosPrivate.patch("/users/me/compare/remove", {
      productId: id,
    });
  } catch (err: any) {
    dispatch({ type: UserActionKind.REMOVE_FROM_COMPARE_FAIL, payload: id });
    const error = err.response?.data.message || "Something went wrong.";
    toast.error(error);
  }
};
