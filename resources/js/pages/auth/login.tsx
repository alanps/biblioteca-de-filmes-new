import { Head } from '@inertiajs/react';

import Signature from "@/components/signature";
import LeftSide from "@/components/left-side";
import LoginBox from '@/components/login-box';

export default function Login() {
    return (
        <>
            <Head />
            
            <div class="page">

                <LeftSide />

                <div class="right-side">
                    
                    <LoginBox />
            
                    <div class="bottom-box"></div>

                </div>

            </div>

            <Signature />

        </>
    );
}
