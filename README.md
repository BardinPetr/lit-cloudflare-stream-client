# Lit integration with Cloudflare Stream - client library

This is a React Components library which in pair with [backend](https://github.com/BardinPetr/lit-cloudflare-stream-worker) allows using [LIT network](https://litprotocol.com/) as authentication layer for CloudFlare Stream service using JWT.

> **It is highly recommended to read documentation in [server repo](https://github.com/BardinPetr/lit-cloudflare-stream-worker) first as I won't duplicate here how the system works**

> Watch [demo](https://youtu.be/MYa6ne3MU7w). Or try it yourself [here](https://litcf.bardinpa.ru/). Register token is `yRJj169LRxiCpoE6Wduqz9UtYoKa4AKPRwUR90ASXgE4OZVHd7ZtpyEK5VTAZ5oe`. For main account all ACCs are set to non-zero eth balance.

This repo also provides demo application, which serves firstly to demonstrate features of components you can easily integrate into any React project. All components are done in configuration-minimalistic way to easily integrate it.

### Develop: Website

```shell
git clone https://github.com/BardinPetr/lit-cloudflare-stream-client
yarn
yarn start
# or yarn build
```

## Components documentation

### LITCFProvider

This component is mandatory in any app using this lib as it provides it's child components LIT network client and important configs as React Context. Any of following

##### Usage

```jsx
<LITCFProvider
  gateway={"https://address.of.your.backend.com"}
  userId={"your_cloudflare_account_id"}
  chain={"chain_name_for_lit_client"}
>
  <SomeComponent />
</LITCFProvider>
```

### Video

This component is an wrapper over original CF Stream video player that includes everything required to unlock video.
The underlying process is following:

1.  Request from backend video info
2.  Get user's signature from Metamask
3.  Get JWT from LIT network
4.  Send JWT to backend and get token for video
5.  Play video via original CF player with _signedURL_

##### Usage

```jsx
<Video videoId={"somevideoid"} />
```

### RegisterAccountForm

> Please read about what is a [registration procedure](https://github.com/BardinPetr/lit-cloudflare-stream-worker#idea) before continuing

Component should be placed in some kind of _'admin area'_ on your site as it provides the way to easily register new account in server by providing _Register Secret_ using for authentication, _CF account_, _CF token_ and two selectors for ACCs which are based on [lit-access-control-conditions-modal](https://github.com/LIT-Protocol/lit-access-control-conditions-modal).

The underlying process is following:

1.  Get all info from user
2.  Check if it is allowed to register such account via request to backend
3.  Run `saveSigningCondition` on LIT network for both upload and setup endpoints
4.  Save registration info on backend

##### Usage

```jsx
<RegisterAccountForm />
```

### Upload

The component used for uploading video to CF Stream. It doesn't do anything to apply restrictions on video.

The underlying process is following:

1.  Request from backend ACCs for upload and setup
2.  Get user's signature from Metamask
3.  Get JWT from LIT network
4.  Get one-time URL for uploading
5.  Upload video using form data

##### Usage

```jsx
<Upload />
```

### VideoSetup

This is the components allows user to setup ACCs for video.

The underlying process is following:

1.  Request from backend ACCs for upload and setup
2.  Get user's signature from Metamask
3.  Get JWT from LIT network
4.  Run `saveSigningCondition` on LIT network to set ACCs
5.  Send to backend updated ACCs for video

##### Usage

```jsx
<VideoSetup />
/* OR if you want to disable internal video selector */
<VideoSetup videoId={'somevideoid'}/>
```
