import { Pipe, PipeTransform } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

@Pipe({
  name: "cachedFile",
  standalone: true,
  pure: true,
})
export class CachedFilePipe implements PipeTransform {
  async transform(fileUrl?: string): Promise<string | undefined> {
    if (!fileUrl) return undefined;

    const fileName = fileUrl.split("/").pop();

    if (!fileName) return fileUrl;

    const cachedFile = await this.getFileFromCache(fileName);
    return cachedFile ?? this.cacheFile(fileUrl, fileName);
  }

  private async getFileFromCache(
    fileName: string
  ): Promise<string | undefined> {
    try {
      const { uri } = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      });
      return Capacitor.convertFileSrc(uri);
    } catch (error) {
      return undefined;
    }
  }

  private async cacheFile(
    fileUrl: string,
    fileName: string
  ): Promise<string | undefined> {
    try {
      const { path } = await Filesystem.downloadFile({
        path: fileName,
        url: fileUrl,
        directory: Directory.Cache,
      });
      if (!path) {
        return fileUrl;
      }

      return Capacitor.convertFileSrc(path);
    } catch (error) {
      return fileUrl;
    }
  }
}
