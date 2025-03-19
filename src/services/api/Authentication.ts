import { Axios } from "../axiosInstance";
import { Endpoints } from "../Endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export const useAdminLogin = () => {
    return useMutation({
        mutationFn: async (postdata: any) => {
            const res = await Axios.post(Endpoints.adminLogin, postdata);
            Cookies.set("token", res.data.token, { expires: 7 });
            return await res.data;
        }
    });
};