import  Axios  from "../axiosInstance";
import ENDPOINTS from "../Endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export const useAdminLogin = () => {
    return useMutation({
        mutationFn: async (postdata: any) => {
            const res = await Axios.post(ENDPOINTS.AUTH.LOGIN, postdata);
            Cookies.set("token", res.data.token, { expires: 30 });
            return await res.data;
        }
    });
};