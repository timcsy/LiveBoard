<template>
	<v-card>
		<v-list-item three-line>
			<v-list-item-content class="align-self-start">
				<v-list-item-title class="headline mb-2" v-text="item.title"></v-list-item-title>
				<v-list-item-subtitle :v-text="text"></v-list-item-subtitle>
			</v-list-item-content>

			<v-list-item-avatar size="125" tile>
				<v-img :src="thumbnail"></v-img>
			</v-list-item-avatar>
			<v-divider light></v-divider>
			<v-card-actions>
				<v-btn text>{{action}}</v-btn>
			</v-card-actions>
		</v-list-item>
	</v-card>
  <!-- <v-flex xs12 sm6 md4>
		<v-card color="white" light>
			<v-layout>
				<v-flex xs5 align-self-center pl-4>
					<v-img
						:src="thumbnail"
						height="125px"
						contain
					></v-img>
				</v-flex>
				<v-flex xs7>
					<v-card-title primary-title>
						<div>
							<div class="headline">{{title}}</div>
							<span>{{text}}</span>
						</div>
					</v-card-title>
				</v-flex>
			</v-layout>
			<v-divider light></v-divider>
			<v-card-actions>
				<v-btn text>詳細內容</v-btn>
			</v-card-actions>
		</v-card>
	</v-flex> -->
</template>

<script>
  export default {
    data: () => ({
      
    }),
    props: {
			thumbnail: {
				type: String,
				default: 'https://tshop.r10s.com/4a5/f1d/fc8c/d0bd/d0cd/9c69/4550/11d7e79a022c600c73774e.jpg'
			},
			title: {
				type: String,
				default: '第幾頁'
			},
			text: {
				type: String,
				default: '...第幾頁文字文字文字文字文字 文字文字文字文字文字文字文字文字文字...'
			},
			action: {
				type: String,
				default: '查看'
			}
    },
    methods: {
      
    }
  }
</script>

<style>
  
</style>