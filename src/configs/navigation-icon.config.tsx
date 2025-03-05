import {
    PiHouseLineDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiChartBarDuotone,
    PiBagSimpleDuotone,
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
}

export default navigationIcon
