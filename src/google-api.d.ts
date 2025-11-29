// Type definitions for Google APIs loaded via script tags

declare const gapi: {
  load: (api: string, callback: () => void) => void;
  client: {
    setApiKey: (key: string) => void;
  };
};

declare namespace google {
  namespace picker {
    enum ViewId {
      DOCS = 'all',
      DOCS_IMAGES = 'docs-images',
      DOCS_IMAGES_AND_VIDEOS = 'docs-images-and-videos',
      DOCS_VIDEOS = 'docs-videos',
      DOCUMENTS = 'documents',
      DRAWINGS = 'drawings',
      FOLDERS = 'folders',
      FORMS = 'forms',
      IMAGE_SEARCH = 'image-search',
      MAPS = 'maps',
      PDFS = 'pdfs',
      PHOTO_ALBUMS = 'photo-albums',
      PHOTO_UPLOAD = 'photo-upload',
      PHOTOS = 'photos',
      PRESENTATIONS = 'presentations',
      RECENTLY_PICKED = 'recently-picked',
      SPREADSHEETS = 'spreadsheets',
      VIDEO_SEARCH = 'video-search',
      WEBCAM = 'webcam',
      YOUTUBE = 'youtube',
    }

    enum Action {
      CANCEL = 'cancel',
      PICKED = 'picked',
    }

    interface Document {
      id: string;
      name: string;
      mimeType: string;
      url: string;
      parentId?: string;
    }

    interface ResponseObject {
      action: string;
      docs: Document[];
    }

    class DocsView {
      constructor(viewId?: ViewId);
      setIncludeFolders(include: boolean): DocsView;
      setMimeTypes(mimeTypes: string): DocsView;
      setParent(parent: string): DocsView;
    }

    class PickerBuilder {
      addView(view: DocsView): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setCallback(callback: (data: ResponseObject) => void): PickerBuilder;
      setTitle(title: string): PickerBuilder;
      build(): Picker;
    }

    interface Picker {
      setVisible(visible: boolean): void;
    }
  }
}
