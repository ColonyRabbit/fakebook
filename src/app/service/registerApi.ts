import { IResponseRegisterType } from "../type/registerType";

// registerApi.ts
const registerApi = (() => {
  const apiBaseUrl = "/api";

  const registerUser = async (
    userData: FormData
  ): Promise<IResponseRegisterType> => {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: "POST",
      body: userData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
    return data as IResponseRegisterType;
  };

  return {
    registerUser,
  };
})();

export default registerApi;
