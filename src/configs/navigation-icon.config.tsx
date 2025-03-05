import {
    PiHouseLineDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiChartBarDuotone,
    PiBagSimpleDuotone,
    PiShieldDuotone,
    PiEnvelopeDuotone,
    PiUserGearDuotone
} from 'react-icons/pi'
import type { JSX } from 'react'
import { BsBoxSeam } from "react-icons/bs";

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    singleMenu: <PiChartBarDuotone />,
    products: <BsBoxSeam />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    // Ícones para administração
    shield: <PiShieldDuotone />,
    email: <PiEnvelopeDuotone />,
    'shield-user': <PiUserGearDuotone />,
}

export default navigationIcon
