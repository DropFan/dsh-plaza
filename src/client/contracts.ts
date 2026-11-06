import type { Context as CordisContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {
  MarketIndexSummary,
  MarketListingEntry,
  MarketSearchResult,
  MarketSort,
  PluginDetail,
  RemoteResult,
} from '@deepseek-ai/dsh-api-remotes/client'
import type { PluginTabProps } from '@deepseek-ai/dsh-client-ui-plugin-manager/client'

export type ClientContext = CordisContext
export type MarketEntry = MarketListingEntry
export type { MarketIndexSummary, MarketSearchResult, MarketSort, PluginDetail, PluginTabProps, RemoteResult }
