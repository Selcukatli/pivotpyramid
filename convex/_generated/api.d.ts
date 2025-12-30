/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as canvasMessages from "../canvasMessages.js";
import type * as canvasStream from "../canvasStream.js";
import type * as canvases from "../canvases.js";
import type * as ebook_actions from "../ebook/actions.js";
import type * as ebook_auth from "../ebook/auth.js";
import type * as ebook_mutations from "../ebook/mutations.js";
import type * as ebook_queries from "../ebook/queries.js";
import type * as ebookAccess from "../ebookAccess.js";
import type * as ebookAccessCodes from "../ebookAccessCodes.js";
import type * as ebookSubscribers from "../ebookSubscribers.js";
import type * as http from "../http.js";
import type * as lib_fal_actions_generateEbookFigure from "../lib/fal/actions/generateEbookFigure.js";
import type * as lib_fal_clients_falClient from "../lib/fal/clients/falClient.js";
import type * as lib_fal_clients_image_fluxImageClient from "../lib/fal/clients/image/fluxImageClient.js";
import type * as lib_fal_clients_image_fluxProUltraClient from "../lib/fal/clients/image/fluxProUltraClient.js";
import type * as lib_fal_clients_image_fluxSrpoClient from "../lib/fal/clients/image/fluxSrpoClient.js";
import type * as lib_fal_clients_image_geminiImageClient from "../lib/fal/clients/image/geminiImageClient.js";
import type * as lib_fal_clients_image_gptImageClient from "../lib/fal/clients/image/gptImageClient.js";
import type * as lib_fal_clients_image_imageModels from "../lib/fal/clients/image/imageModels.js";
import type * as lib_fal_clients_image_imagenImageClient from "../lib/fal/clients/image/imagenImageClient.js";
import type * as lib_fal_clients_image_kontextImageClient from "../lib/fal/clients/image/kontextImageClient.js";
import type * as lib_fal_clients_image_nanoBananaClient from "../lib/fal/clients/image/nanoBananaClient.js";
import type * as lib_fal_clients_image_qwenImageClient from "../lib/fal/clients/image/qwenImageClient.js";
import type * as lib_fal_clients_image_seedDream4Client from "../lib/fal/clients/image/seedDream4Client.js";
import type * as lib_fal_clients_video_hailuoVideoClient from "../lib/fal/clients/video/hailuoVideoClient.js";
import type * as lib_fal_clients_video_klingVideoClient from "../lib/fal/clients/video/klingVideoClient.js";
import type * as lib_fal_clients_video_lucyVideoClient from "../lib/fal/clients/video/lucyVideoClient.js";
import type * as lib_fal_clients_video_seeDanceVideoClient from "../lib/fal/clients/video/seeDanceVideoClient.js";
import type * as lib_fal_clients_video_videoModels from "../lib/fal/clients/video/videoModels.js";
import type * as lib_fal_falImageActions from "../lib/fal/falImageActions.js";
import type * as lib_fal_falVideoActions from "../lib/fal/falVideoActions.js";
import type * as lib_fal_index from "../lib/fal/index.js";
import type * as lib_fal_test_testComprehensiveImage from "../lib/fal/test/testComprehensiveImage.js";
import type * as lib_fal_test_testComprehensiveVideo from "../lib/fal/test/testComprehensiveVideo.js";
import type * as lib_fal_test_testFalModelIds from "../lib/fal/test/testFalModelIds.js";
import type * as lib_fal_test_testFluxSrpo from "../lib/fal/test/testFluxSrpo.js";
import type * as lib_fal_test_testNanoBanana from "../lib/fal/test/testNanoBanana.js";
import type * as lib_fal_test_testPublic from "../lib/fal/test/testPublic.js";
import type * as lib_fal_test_testUnifiedAPI from "../lib/fal/test/testUnifiedAPI.js";
import type * as lib_fal_types from "../lib/fal/types.js";
import type * as lib_logger from "../lib/logger.js";
import type * as outreach from "../outreach.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  canvasMessages: typeof canvasMessages;
  canvasStream: typeof canvasStream;
  canvases: typeof canvases;
  "ebook/actions": typeof ebook_actions;
  "ebook/auth": typeof ebook_auth;
  "ebook/mutations": typeof ebook_mutations;
  "ebook/queries": typeof ebook_queries;
  ebookAccess: typeof ebookAccess;
  ebookAccessCodes: typeof ebookAccessCodes;
  ebookSubscribers: typeof ebookSubscribers;
  http: typeof http;
  "lib/fal/actions/generateEbookFigure": typeof lib_fal_actions_generateEbookFigure;
  "lib/fal/clients/falClient": typeof lib_fal_clients_falClient;
  "lib/fal/clients/image/fluxImageClient": typeof lib_fal_clients_image_fluxImageClient;
  "lib/fal/clients/image/fluxProUltraClient": typeof lib_fal_clients_image_fluxProUltraClient;
  "lib/fal/clients/image/fluxSrpoClient": typeof lib_fal_clients_image_fluxSrpoClient;
  "lib/fal/clients/image/geminiImageClient": typeof lib_fal_clients_image_geminiImageClient;
  "lib/fal/clients/image/gptImageClient": typeof lib_fal_clients_image_gptImageClient;
  "lib/fal/clients/image/imageModels": typeof lib_fal_clients_image_imageModels;
  "lib/fal/clients/image/imagenImageClient": typeof lib_fal_clients_image_imagenImageClient;
  "lib/fal/clients/image/kontextImageClient": typeof lib_fal_clients_image_kontextImageClient;
  "lib/fal/clients/image/nanoBananaClient": typeof lib_fal_clients_image_nanoBananaClient;
  "lib/fal/clients/image/qwenImageClient": typeof lib_fal_clients_image_qwenImageClient;
  "lib/fal/clients/image/seedDream4Client": typeof lib_fal_clients_image_seedDream4Client;
  "lib/fal/clients/video/hailuoVideoClient": typeof lib_fal_clients_video_hailuoVideoClient;
  "lib/fal/clients/video/klingVideoClient": typeof lib_fal_clients_video_klingVideoClient;
  "lib/fal/clients/video/lucyVideoClient": typeof lib_fal_clients_video_lucyVideoClient;
  "lib/fal/clients/video/seeDanceVideoClient": typeof lib_fal_clients_video_seeDanceVideoClient;
  "lib/fal/clients/video/videoModels": typeof lib_fal_clients_video_videoModels;
  "lib/fal/falImageActions": typeof lib_fal_falImageActions;
  "lib/fal/falVideoActions": typeof lib_fal_falVideoActions;
  "lib/fal/index": typeof lib_fal_index;
  "lib/fal/test/testComprehensiveImage": typeof lib_fal_test_testComprehensiveImage;
  "lib/fal/test/testComprehensiveVideo": typeof lib_fal_test_testComprehensiveVideo;
  "lib/fal/test/testFalModelIds": typeof lib_fal_test_testFalModelIds;
  "lib/fal/test/testFluxSrpo": typeof lib_fal_test_testFluxSrpo;
  "lib/fal/test/testNanoBanana": typeof lib_fal_test_testNanoBanana;
  "lib/fal/test/testPublic": typeof lib_fal_test_testPublic;
  "lib/fal/test/testUnifiedAPI": typeof lib_fal_test_testUnifiedAPI;
  "lib/fal/types": typeof lib_fal_types;
  "lib/logger": typeof lib_logger;
  outreach: typeof outreach;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  persistentTextStreaming: {
    lib: {
      addChunk: FunctionReference<
        "mutation",
        "internal",
        { final: boolean; streamId: string; text: string },
        any
      >;
      createStream: FunctionReference<"mutation", "internal", {}, any>;
      getStreamStatus: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        "pending" | "streaming" | "done" | "error" | "timeout"
      >;
      getStreamText: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          text: string;
        }
      >;
      setStreamStatus: FunctionReference<
        "mutation",
        "internal",
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          streamId: string;
        },
        any
      >;
    };
  };
};
