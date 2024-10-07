<!-- 一个自定义的组件，配合el-select使用，实现上滑加载更多和取消/确定按钮 -->
<template>
    <el-option ref="el" class="fc-select-loading" value="">
        <template>
            <el-icon class="fc-select-loading__icon">
                <Loading />
            </el-icon>
            <span class="fc-select-loading__tips">正在加载...</span>
        </template>
        <!-- <template v-else>~到底了~</template> -->
    </el-option>
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from "vue";
import { ElOption } from "element-plus";

interface Props {
    page: number;       // 当前页码
    loading: boolean;   // 是否加载中，用来过滤重复的加载
    // hasMore: boolean;   // 是否有更多数据可加载
}

const props = defineProps<Props>();

interface Emits {
    (event: "loadMore", data: number): any;
}

const emit = defineEmits<Emits>();

const el = ref<typeof ElOption>();
const observer = ref<IntersectionObserver>();

onMounted(() => {
    if (!el.value) {
        return;
    }
    const callback: IntersectionObserverCallback = (entries) => {
        if (props.loading || !entries[0].isIntersecting) {
            return;
        }
        emit("loadMore", props.page + 1);
    };
    const options: IntersectionObserverInit = {
        root: el.value.$el.parentElement?.parentElement,
        rootMargin: "0px 0px 0px 0px",
    };
    observer.value = new IntersectionObserver(callback, options);
    observer.value.observe(el.value.$el);
});

// 组件卸载成功，取消滚动监听
onUnmounted(() => {
    if (!el.value) {
        return;
    }
    observer.value?.unobserve(el.value.$el);
});
</script>

<style scoped lang="scss">
.fc-select-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: initial;
    pointer-events: none;
    color: var(--el-color-info);
    font-size: 12px;

    &__icon {
        font-size: 16px;
        animation: rotate 1.5s linear infinite;
    }

    &__tips {
        margin-left: 6px;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }
}
</style>